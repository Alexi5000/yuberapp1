import { createWorkflow, createStep } from "@mastra/core/workflows";
import * as z from "zod/v4";
import { store } from "@/store";
import {
  LocationSchema,
  ServiceAgentSchema,
  DispatchResultSchema,
  type ServiceAgent,
  type Location,
} from "@/mastra/schemas";
import { categorizeIssue } from "@/mastra/tools/categorizeIssueTool";
import { searchYelp } from "@/mastra/tools/yelpSearchTool";
import { createDispatch } from "@/mastra/tools/dispatchAgentTool";
import { logger } from "@/lib/logger";
import {
  wrapWorkflow,
  type TraceWrapperMetadata,
  type TracedResult,
  type WorkflowExecutionResult,
} from "@/lib/opik/traceWrapper";

/**
 * Step 1: Categorize the issue
 * - Creates a new request in the store
 * - Calls categorizeIssueTool to determine the category
 * - Updates request status to "categorized"
 * Requirements: 4.1, 4.2
 */
export const categorizeStep = createStep({
  id: "categorize",
  description: "Creates request and categorizes the issue",
  inputSchema: z.object({
    issue: z.string(),
    userId: z.string(),
    location: LocationSchema,
  }),
  outputSchema: z.object({
    success: z.boolean(),
    category: z.string().optional(),
    requestId: z.string().optional(),
    location: LocationSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
      })
      .optional(),
  }),
  execute: async ({ inputData }) => {
    logger.workflow.step("categorize", "Starting issue categorization", { userId: inputData.userId });

    try {
      // Create request in store with initial "pending" status
      const request = await store.createRequest({
        userId: inputData.userId,
        location: inputData.location,
        issue: inputData.issue,
        urgency: "medium",
      });

      logger.tool.execute("categorizeIssue", { issue: inputData.issue.slice(0, 50) });
      // Categorize the issue
      const result = await categorizeIssue(inputData.issue);

      if (!result.success) {
        logger.tool.result("categorizeIssue", false, { error: "Failed to categorize" });
        return {
          success: false,
          error: {
            code: "CATEGORIZATION_FAILED",
            message: "Failed to categorize issue",
          },
        };
      }

      logger.tool.result("categorizeIssue", true, { category: result.data.category });

      // Update request with category
      await store.updateRequestCategory(request.id, result.data.category);

      // Update status to "categorized"
      const statusResult = await store.updateRequestStatus(request.id, "categorized");
      if (!statusResult.success) {
        logger.workflow.error("emergency-workflow", "categorize", statusResult.error);
        return {
          success: false,
          error: {
            code: "STATUS_UPDATE_FAILED",
            message: statusResult.error || "Failed to update status",
          },
        };
      }

      logger.workflow.step("categorize", "Completed categorization", { category: result.data.category });

      return {
        success: true,
        category: result.data.category,
        requestId: request.id,
        location: inputData.location,
      };
    } catch (error) {
      logger.workflow.error("emergency-workflow", "categorize", error);
      return {
        success: false,
        error: {
          code: "CATEGORIZE_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  },
});


/**
 * Step 2: Search for service providers
 * - Calls yelpSearchTool to find providers
 * - Updates request status to "searching" then "matched"
 * Requirements: 4.1, 4.2
 */
export const searchStep = createStep({
  id: "search",
  description: "Searches for service providers via Yelp",
  inputSchema: z.object({
    success: z.boolean(),
    category: z.string().optional(),
    requestId: z.string().optional(),
    location: LocationSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
      })
      .optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    providers: z.array(ServiceAgentSchema).optional(),
    requestId: z.string().optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
      })
      .optional(),
  }),
  execute: async ({ inputData }) => {
    logger.workflow.step("search", "Starting provider search");

    // Pass through errors from previous step
    if (!inputData.success || inputData.error) {
      logger.workflow.step("search", "Skipping - previous step failed");
      return {
        success: false,
        error: inputData.error || {
          code: "PREVIOUS_STEP_FAILED",
          message: "Previous step failed",
        },
      };
    }

    if (!inputData.category || !inputData.requestId || !inputData.location) {
      logger.workflow.error("emergency-workflow", "search", "Missing required input");
      return {
        success: false,
        error: {
          code: "MISSING_INPUT",
          message: "Missing category, requestId, or location",
        },
      };
    }

    try {
      // Update status to "searching"
      const searchingResult = await store.updateRequestStatus(
        inputData.requestId,
        "searching"
      );
      if (!searchingResult.success) {
        return {
          success: false,
          error: {
            code: "STATUS_UPDATE_FAILED",
            message: searchingResult.error || "Failed to update status to searching",
          },
        };
      }

      logger.tool.execute("yelpSearch", { category: inputData.category });
      // Search for providers
      const result = await searchYelp(
        inputData.category,
        inputData.location.lat,
        inputData.location.lng
      );

      const providerCount = result.data?.length || 0;
      logger.tool.result("yelpSearch", true, { providerCount });

      // Update status to "matched"
      const matchedResult = await store.updateRequestStatus(
        inputData.requestId,
        "matched"
      );
      if (!matchedResult.success) {
        return {
          success: false,
          error: {
            code: "STATUS_UPDATE_FAILED",
            message: matchedResult.error || "Failed to update status to matched",
          },
        };
      }

      logger.workflow.step("search", "Completed provider search", { providerCount });

      return {
        success: true,
        providers: result.data || [],
        requestId: inputData.requestId,
      };
    } catch (error) {
      logger.workflow.error("emergency-workflow", "search", error);
      return {
        success: false,
        error: {
          code: "SEARCH_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  },
});


/**
 * Step 3: Dispatch the best provider
 * - Selects the best provider (first in list, sorted by rating)
 * - Calls dispatchAgentTool to create dispatch
 * - Updates request status to "dispatched"
 * Requirements: 4.1, 4.2
 */
export const dispatchStep = createStep({
  id: "dispatch",
  description: "Dispatches the best available provider",
  inputSchema: z.object({
    success: z.boolean(),
    providers: z.array(ServiceAgentSchema).optional(),
    requestId: z.string().optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
      })
      .optional(),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    dispatch: DispatchResultSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
      })
      .optional(),
  }),
  execute: async ({ inputData }) => {
    logger.workflow.step("dispatch", "Starting dispatch");

    // Pass through errors from previous step
    if (!inputData.success || inputData.error) {
      logger.workflow.step("dispatch", "Skipping - previous step failed");
      return {
        success: false,
        error: inputData.error || {
          code: "PREVIOUS_STEP_FAILED",
          message: "Previous step failed",
        },
      };
    }

    if (!inputData.requestId) {
      logger.workflow.error("emergency-workflow", "dispatch", "Missing requestId");
      return {
        success: false,
        error: {
          code: "MISSING_INPUT",
          message: "Missing requestId",
        },
      };
    }

    // Check if we have providers
    if (!inputData.providers || inputData.providers.length === 0) {
      logger.workflow.error("emergency-workflow", "dispatch", "No providers available");
      return {
        success: false,
        error: {
          code: "NO_PROVIDERS",
          message: "No providers found",
        },
      };
    }

    try {
      // Select best provider (first in list, already sorted by rating)
      const bestProvider = inputData.providers[0];
      logger.workflow.step("dispatch", "Selected best provider", { 
        providerId: bestProvider.id, 
        rating: bestProvider.rating 
      });

      logger.tool.execute("createDispatch", { requestId: inputData.requestId, providerId: bestProvider.id });
      // Create dispatch
      const result = await createDispatch(inputData.requestId, bestProvider.id);

      if (!result.success || !result.data) {
        logger.tool.result("createDispatch", false, result.error);
        return {
          success: false,
          error: result.error
            ? { code: result.error.code, message: result.error.message }
            : { code: "DISPATCH_FAILED", message: "Failed to create dispatch" },
        };
      }

      logger.tool.result("createDispatch", true, { dispatchId: result.data.id });

      // Update request status to "dispatched"
      const statusResult = await store.updateRequestStatus(
        inputData.requestId,
        "dispatched"
      );
      if (!statusResult.success) {
        return {
          success: false,
          error: {
            code: "STATUS_UPDATE_FAILED",
            message: statusResult.error || "Failed to update status to dispatched",
          },
        };
      }

      // Link dispatch to request
      await store.linkDispatchToRequest(inputData.requestId, result.data.id);

      logger.workflow.complete("emergency-workflow", { dispatchId: result.data.id });

      return {
        success: true,
        dispatch: result.data,
      };
    } catch (error) {
      logger.workflow.error("emergency-workflow", "dispatch", error);
      return {
        success: false,
        error: {
          code: "DISPATCH_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  },
});


/**
 * Emergency Workflow
 * Orchestrates the full request→search→dispatch flow
 * Status transitions: pending → categorized → searching → matched → dispatched
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export const emergencyWorkflow = createWorkflow({
  id: "emergency-workflow",
  description: "Orchestrates emergency service request from intake to dispatch",
  inputSchema: z.object({
    issue: z.string(),
    userId: z.string(),
    location: LocationSchema,
  }),
  outputSchema: z.object({
    success: z.boolean(),
    dispatch: DispatchResultSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
      })
      .optional(),
  }),
})
  .then(categorizeStep)
  .then(searchStep)
  .then(dispatchStep)
  .commit();

/**
 * Input type for emergency workflow
 */
export interface EmergencyWorkflowInput {
  issue: string;
  userId: string;
  location: Location;
}

/**
 * Output type for emergency workflow
 */
export interface EmergencyWorkflowOutput extends WorkflowExecutionResult {
  success: boolean;
  output?: unknown;
  dispatch?: z.infer<typeof DispatchResultSchema>;
  error?: { code: string; message: string };
}

/**
 * Helper function to execute the emergency workflow
 * Returns the workflow result with proper typing
 */
export async function executeEmergencyWorkflow(input: {
  issue: string;
  userId: string;
  location: Location;
}): Promise<{
  success: boolean;
  dispatch?: z.infer<typeof DispatchResultSchema>;
  error?: { code: string; message: string };
}> {
  logger.workflow.start("emergency-workflow", { userId: input.userId });

  try {
    const run = await emergencyWorkflow.createRunAsync();

    const result = await run.start({
      inputData: input,
    });

    // Extract the final step result from the workflow output
    if (result.status === "success" && result.result) {
      return result.result as {
        success: boolean;
        dispatch?: z.infer<typeof DispatchResultSchema>;
        error?: { code: string; message: string };
      };
    }

    // Handle workflow-level errors
    logger.workflow.error("emergency-workflow", "execution", "Workflow returned non-success status");
    return {
      success: false,
      error: {
        code: "WORKFLOW_ERROR",
        message: "Workflow execution failed",
      },
    };
  } catch (error) {
    logger.workflow.error("emergency-workflow", "execution", error);
    // Catch any unexpected errors and return error object
    return {
      success: false,
      error: {
        code: "WORKFLOW_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Creates a traced version of the emergency workflow
 *
 * Wraps the emergencyWorkflow with Opik tracing to capture:
 * - Workflow name
 * - Input parameters
 * - Start timestamp
 * - Total duration on completion
 * - Final status
 * - Output
 *
 * Requirements: 4.1
 *
 * @param metadata - Trace metadata (userId, sessionId, requestId, environment)
 * @returns A function that executes the workflow with tracing
 */
export function createTracedEmergencyWorkflow(
  metadata: TraceWrapperMetadata
): (input: EmergencyWorkflowInput) => Promise<TracedResult<EmergencyWorkflowOutput>> {
  const wrapper = wrapWorkflow<EmergencyWorkflowInput, EmergencyWorkflowOutput>(
    "emergency-workflow",
    metadata
  );

  return wrapper(async (input: EmergencyWorkflowInput): Promise<EmergencyWorkflowOutput> => {
    const result = await executeEmergencyWorkflow(input);

    return {
      success: result.success,
      output: result.dispatch,
      dispatch: result.dispatch,
      error: result.error,
    };
  });
}

/**
 * Executes the emergency workflow with Opik tracing
 *
 * Convenience function that creates a traced workflow and executes it.
 *
 * @param input - Workflow input with issue, userId, and location
 * @param metadata - Trace metadata
 * @returns Traced result with workflow output, traceId, and latency
 */
export async function executeTracedEmergencyWorkflow(
  input: EmergencyWorkflowInput,
  metadata: TraceWrapperMetadata
): Promise<TracedResult<EmergencyWorkflowOutput>> {
  const tracedWorkflow = createTracedEmergencyWorkflow(metadata);
  return tracedWorkflow(input);
}
