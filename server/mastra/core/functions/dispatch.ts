// file: src/mastra/core/functions/dispatch.ts
// description: Assign a service provider to a request
// reference: src/mastra/tools/dispatchAgentTool.ts, src/lib/db/store.ts

import * as z from "zod/v4";
import { createDispatch } from "@/mastra/tools/dispatchAgentTool";
import { store } from "@/store";
import { DispatchResultSchema } from "@/mastra/schemas";
import { logger } from "@/lib/logger";

// =============================================================================
// SCHEMAS
// =============================================================================

/**
 * Input schema for dispatch function
 */
export const DispatchInputSchema = z.object({
  request_id: z.string().min(1),
  provider_id: z.string().min(1),
});

export type DispatchInput = z.infer<typeof DispatchInputSchema>;

/**
 * Output schema for dispatch function
 */
export const DispatchOutputSchema = z.object({
  success: z.boolean(),
  dispatch: DispatchResultSchema.optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
  }).optional(),
});

export type DispatchOutput = z.infer<typeof DispatchOutputSchema>;

// =============================================================================
// DISPATCH FUNCTION
// =============================================================================

/**
 * dispatch - Assign a service provider to a request
 *
 * Creates a dispatch record linking a provider to a service request.
 * Calculates ETA and cost estimate, updates request status.
 *
 * Features:
 * - Validates request exists
 * - Creates dispatch with ETA and cost estimate
 * - Links dispatch to request
 * - Updates request status to "dispatched"
 *
 * Single Responsibility: Provider assignment
 *
 * @param input - Request ID and provider ID
 * @returns Dispatch record with ETA and cost
 */
export async function dispatch(input: DispatchInput): Promise<DispatchOutput> {
  const { request_id, provider_id } = input;

  logger.tool.execute("dispatch", { request_id, provider_id });

  try {
    // Validate request exists
    const request = await store.getRequest(request_id);

    if (!request) {
      return {
        success: false,
        error: {
          code: "REQUEST_NOT_FOUND",
          message: `Request ${request_id} not found`,
        },
      };
    }

    // Check request is in valid state for dispatch
    const valid_states = ["pending", "categorized", "searching", "matched"];
    if (!valid_states.includes(request.status)) {
      return {
        success: false,
        error: {
          code: "INVALID_REQUEST_STATE",
          message: `Request is in ${request.status} state, cannot dispatch`,
        },
      };
    }

    // Create dispatch
    const dispatch_result = await createDispatch(request_id, provider_id);

    if (!dispatch_result.success || !dispatch_result.data) {
      return {
        success: false,
        error: dispatch_result.error || {
          code: "DISPATCH_FAILED",
          message: "Failed to create dispatch",
        },
      };
    }

    // Link dispatch to request
    await store.linkDispatchToRequest(request_id, dispatch_result.data.id);

    // Update request status to dispatched
    await store.updateRequestStatus(request_id, "dispatched");

    logger.tool.result("dispatch", true, {
      dispatch_id: dispatch_result.data.id,
      eta: dispatch_result.data.eta,
      cost: dispatch_result.data.costEstimate,
    });

    return {
      success: true,
      dispatch: dispatch_result.data,
    };
  } catch (error) {
    logger.tool.error("dispatch failed", error);

    return {
      success: false,
      error: {
        code: "DISPATCH_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

