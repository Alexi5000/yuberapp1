/**
 * MetricComputer Module
 *
 * Computes evaluation metrics for LLM outputs including relevance,
 * hallucination detection, selection quality, and category accuracy.
 * All metrics return values in the 0.0 to 1.0 range.
 *
 * @module opik/metricComputer
 */

import type { ServiceAgent } from "@/mastra/schemas";

/**
 * Input for metric computation
 */
export interface MetricInput {
  name: string;
  value: number;
  category: "quality" | "performance" | "cost";
}

/**
 * Result of a metric computation
 */
export interface MetricResult {
  name: string;
  value: number;
  category: "quality" | "performance" | "cost";
  metadata?: Record<string, unknown>;
}

/**
 * Known issue-category mappings for accuracy computation
 */
export const KNOWN_CATEGORY_MAPPINGS: Record<string, string> = {
  "locked out": "locksmith",
  "lost keys": "locksmith",
  "broken lock": "locksmith",
  "pipe burst": "plumber",
  "water leak": "plumber",
  "clogged drain": "plumber",
  "no hot water": "plumber",
  "power outage": "electrician",
  "electrical fire": "electrician",
  "broken outlet": "electrician",
  "broken window": "glass",
  "shattered glass": "glass",
};

/**
 * Emergency-related keywords for relevance scoring
 */
const EMERGENCY_KEYWORDS = [
  "help",
  "emergency",
  "urgent",
  "immediately",
  "asap",
  "right away",
  "now",
  "fast",
  "quick",
  "dispatch",
  "send",
  "provider",
  "service",
  "fix",
  "repair",
  "assist",
  "support",
];

/**
 * Clamps a value to the 0.0 to 1.0 range
 */
export function clampMetric(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}


/**
 * Computes relevance score for HelpAgent responses
 *
 * Measures how well the response addresses the user's emergency by:
 * 1. Checking if response acknowledges the emergency type
 * 2. Checking if response mentions relevant action items
 * 3. Checking if response uses context appropriately
 *
 * Requirements: 5.1
 *
 * @param input - User's input message describing the emergency
 * @param output - Agent's response to the user
 * @param context - Additional context provided to the agent
 * @returns Relevance score between 0.0 and 1.0
 */
export function computeRelevance(
  input: string,
  output: string,
  context: string[]
): number {
  if (!input || !output) {
    return 0;
  }

  const inputLower = input.toLowerCase();
  const outputLower = output.toLowerCase();
  const contextText = context.join(" ").toLowerCase();

  let score = 0;
  let factors = 0;

  // Factor 1: Response length appropriateness (not too short, not too long)
  factors++;
  const outputLength = output.length;
  if (outputLength >= 20 && outputLength <= 2000) {
    score += 1;
  } else if (outputLength >= 10 && outputLength <= 3000) {
    score += 0.5;
  }

  // Factor 2: Response addresses emergency keywords from input
  factors++;
  const inputWords = inputLower.split(/\s+/).filter((w) => w.length > 3);
  const matchedInputWords = inputWords.filter((word) =>
    outputLower.includes(word)
  );
  if (inputWords.length > 0) {
    score += matchedInputWords.length / inputWords.length;
  }

  // Factor 3: Response contains action-oriented language
  factors++;
  const actionKeywords = EMERGENCY_KEYWORDS.filter((keyword) =>
    outputLower.includes(keyword)
  );
  score += Math.min(1, actionKeywords.length / 3);

  // Factor 4: Response uses context appropriately
  if (context.length > 0 && contextText.length > 0) {
    factors++;
    const contextWords = contextText.split(/\s+/).filter((w) => w.length > 3);
    const usedContextWords = contextWords.filter((word) =>
      outputLower.includes(word)
    );
    if (contextWords.length > 0) {
      score += usedContextWords.length / contextWords.length;
    }
  }

  // Factor 5: Response doesn't just repeat the input
  factors++;
  const similarity = computeTextSimilarity(inputLower, outputLower);
  if (similarity < 0.8) {
    score += 1 - similarity;
  }

  return clampMetric(score / factors);
}

/**
 * Computes text similarity using Jaccard index
 */
function computeTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.split(/\s+/).filter((w) => w.length > 2));
  const words2 = new Set(text2.split(/\s+/).filter((w) => w.length > 2));

  if (words1.size === 0 && words2.size === 0) {
    return 1;
  }

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Computes hallucination score for detecting fabricated information
 *
 * Detects information in the output that is not grounded in the input
 * or provided context. Higher score means more hallucination detected.
 *
 * Requirements: 5.2
 *
 * @param output - Agent's response to analyze
 * @param context - Context that was provided to the agent
 * @returns Hallucination score between 0.0 (no hallucination) and 1.0 (high hallucination)
 */
export function computeHallucination(output: string, context: string[]): number {
  if (!output) {
    return 0;
  }

  const outputLower = output.toLowerCase();
  const contextText = context.join(" ").toLowerCase();

  let hallucinationIndicators = 0;
  let totalChecks = 0;

  // Check 1: Specific numbers/statistics not in context
  totalChecks++;
  const numbersInOutput = outputLower.match(/\d+(\.\d+)?%?/g) || [];
  const numbersInContext = contextText.match(/\d+(\.\d+)?%?/g) || [];
  const contextNumberSet = new Set(numbersInContext);

  const ungroundedNumbers = numbersInOutput.filter(
    (num) => !contextNumberSet.has(num)
  );
  if (numbersInOutput.length > 0) {
    hallucinationIndicators += ungroundedNumbers.length / numbersInOutput.length;
  }

  // Check 2: Specific names/entities not in context
  totalChecks++;
  const properNouns = outputLower.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  if (properNouns.length > 0) {
    const ungroundedNames = properNouns.filter(
      (name) => !contextText.includes(name.toLowerCase())
    );
    hallucinationIndicators += ungroundedNames.length / properNouns.length;
  }

  // Check 3: Certainty language without grounding
  totalChecks++;
  const certaintyPhrases = [
    "definitely",
    "certainly",
    "absolutely",
    "guaranteed",
    "always",
    "never",
    "100%",
    "proven",
  ];
  const certaintyCount = certaintyPhrases.filter((phrase) =>
    outputLower.includes(phrase)
  ).length;
  hallucinationIndicators += Math.min(1, certaintyCount / 2);

  // Check 4: Quotes or citations not in context
  totalChecks++;
  const quotes = output.match(/"[^"]+"/g) || [];
  if (quotes.length > 0) {
    const ungroundedQuotes = quotes.filter(
      (quote) => !contextText.includes(quote.toLowerCase().replace(/"/g, ""))
    );
    hallucinationIndicators += ungroundedQuotes.length / quotes.length;
  }

  return clampMetric(hallucinationIndicators / totalChecks);
}


/**
 * Computes selection quality score for DispatchAgent provider selection
 *
 * Evaluates how well the selected provider matches the criteria:
 * - Rating (higher is better)
 * - Distance (closer is better)
 * - Availability (must be available)
 * - Relative ranking among alternatives
 *
 * Requirements: 5.3
 *
 * @param provider - The selected service provider
 * @param alternatives - Other available providers that could have been selected
 * @returns Selection quality score between 0.0 and 1.0
 */
export function computeSelectionQuality(
  provider: ServiceAgent,
  alternatives: ServiceAgent[]
): number {
  if (!provider) {
    return 0;
  }

  // If no alternatives, evaluate the provider on its own merits
  if (alternatives.length === 0) {
    return computeProviderScore(provider);
  }

  // Include the selected provider in the comparison set
  const allProviders = [provider, ...alternatives];

  // Compute scores for all providers
  const scores = allProviders.map((p) => ({
    provider: p,
    score: computeProviderScore(p),
  }));

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  // Find the rank of the selected provider
  const selectedRank = scores.findIndex((s) => s.provider.id === provider.id);
  const totalProviders = scores.length;

  // Quality is based on how close to optimal the selection was
  // Rank 0 (best) = 1.0, last rank = lower score
  const rankScore = 1 - selectedRank / totalProviders;

  // Also factor in the absolute quality of the selected provider
  const absoluteScore = computeProviderScore(provider);

  // Weighted combination: 60% relative ranking, 40% absolute quality
  return clampMetric(0.6 * rankScore + 0.4 * absoluteScore);
}

/**
 * Computes an individual provider's quality score
 */
function computeProviderScore(provider: ServiceAgent): number {
  let score = 0;
  let factors = 0;

  // Factor 1: Rating (0-5 scale normalized to 0-1)
  factors++;
  score += provider.rating / 5;

  // Factor 2: Availability (binary)
  factors++;
  score += provider.available ? 1 : 0;

  // Factor 3: Distance (inverse, closer is better)
  // Assume max reasonable distance is 10 miles
  factors++;
  const distanceScore = Math.max(0, 1 - provider.distance / 10);
  score += distanceScore;

  // Factor 4: Review count (more reviews = more reliable)
  // Normalize with diminishing returns (log scale)
  factors++;
  const reviewScore = Math.min(1, Math.log10(provider.reviewCount + 1) / 3);
  score += reviewScore;

  return score / factors;
}

/**
 * Computes category accuracy score for categorizeIssueTool
 *
 * Compares the predicted category against known issue-category mappings.
 * Returns 1.0 for exact match, 0.0 for mismatch.
 *
 * Requirements: 5.4
 *
 * @param predicted - The predicted category from the tool
 * @param groundTruth - The expected/correct category
 * @returns Accuracy score: 1.0 for match, 0.0 for mismatch
 */
export function computeCategoryAccuracy(
  predicted: string,
  groundTruth: string
): number {
  if (!predicted || !groundTruth) {
    return 0;
  }

  const predictedLower = predicted.toLowerCase().trim();
  const groundTruthLower = groundTruth.toLowerCase().trim();

  // Exact match
  if (predictedLower === groundTruthLower) {
    return 1;
  }

  // Check for partial/related matches
  const relatedCategories: Record<string, string[]> = {
    locksmith: ["locks", "keys", "security"],
    plumber: ["plumbing", "water", "pipes", "drain"],
    electrician: ["electrical", "power", "wiring"],
    glass: ["window", "glass", "glazier"],
    handyman: ["general", "misc", "other"],
  };

  // Check if predicted is related to ground truth
  // Use Object.hasOwn to avoid prototype pollution issues with keys like "__proto__"
  const groundTruthRelated = Object.hasOwn(relatedCategories, groundTruthLower)
    ? relatedCategories[groundTruthLower]
    : [];
  if (groundTruthRelated.some((related) => predictedLower.includes(related))) {
    return 0.5; // Partial credit for related category
  }

  return 0;
}

/**
 * Computes estimated cost based on model pricing and token usage
 *
 * @param model - The model name (e.g., "gpt-4o", "gpt-3.5-turbo")
 * @param promptTokens - Number of prompt tokens
 * @param completionTokens - Number of completion tokens
 * @returns Estimated cost in USD
 */
export function computeCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  // Pricing per 1K tokens (as of late 2024)
  const pricing: Record<string, { prompt: number; completion: number }> = {
    "gpt-4o": { prompt: 0.005, completion: 0.015 },
    "gpt-4o-mini": { prompt: 0.00015, completion: 0.0006 },
    "gpt-4-turbo": { prompt: 0.01, completion: 0.03 },
    "gpt-4": { prompt: 0.03, completion: 0.06 },
    "gpt-3.5-turbo": { prompt: 0.0005, completion: 0.0015 },
  };

  const modelLower = model.toLowerCase();
  const modelPricing = pricing[modelLower] || pricing["gpt-4o"]; // Default to gpt-4o

  const promptCost = (promptTokens / 1000) * modelPricing.prompt;
  const completionCost = (completionTokens / 1000) * modelPricing.completion;

  return promptCost + completionCost;
}

/**
 * MetricComputer class for computing and managing evaluation metrics
 */
export class MetricComputer {
  /**
   * Compute relevance score for HelpAgent responses
   */
  computeRelevance(input: string, output: string, context: string[]): number {
    return computeRelevance(input, output, context);
  }

  /**
   * Compute hallucination score for detecting fabricated info
   */
  computeHallucination(output: string, context: string[]): number {
    return computeHallucination(output, context);
  }

  /**
   * Compute selection quality score for DispatchAgent provider selection
   */
  computeSelectionQuality(
    provider: ServiceAgent,
    alternatives: ServiceAgent[]
  ): number {
    return computeSelectionQuality(provider, alternatives);
  }

  /**
   * Compute category accuracy score for categorizeIssueTool
   */
  computeCategoryAccuracy(predicted: string, groundTruth: string): number {
    return computeCategoryAccuracy(predicted, groundTruth);
  }

  /**
   * Compute estimated cost based on model pricing and token usage
   */
  computeCost(
    model: string,
    promptTokens: number,
    completionTokens: number
  ): number {
    return computeCost(model, promptTokens, completionTokens);
  }

  /**
   * Compute all quality metrics for a trace
   */
  computeAllMetrics(params: {
    input?: string;
    output?: string;
    context?: string[];
    provider?: ServiceAgent;
    alternatives?: ServiceAgent[];
    predictedCategory?: string;
    groundTruthCategory?: string;
    model?: string;
    promptTokens?: number;
    completionTokens?: number;
  }): MetricResult[] {
    const results: MetricResult[] = [];

    // Relevance metric
    if (params.input && params.output) {
      results.push({
        name: "relevance",
        value: this.computeRelevance(
          params.input,
          params.output,
          params.context || []
        ),
        category: "quality",
      });
    }

    // Hallucination metric
    if (params.output) {
      results.push({
        name: "hallucination",
        value: this.computeHallucination(params.output, params.context || []),
        category: "quality",
      });
    }

    // Selection quality metric
    if (params.provider) {
      results.push({
        name: "selection_quality",
        value: this.computeSelectionQuality(
          params.provider,
          params.alternatives || []
        ),
        category: "quality",
      });
    }

    // Category accuracy metric
    if (params.predictedCategory && params.groundTruthCategory) {
      results.push({
        name: "category_accuracy",
        value: this.computeCategoryAccuracy(
          params.predictedCategory,
          params.groundTruthCategory
        ),
        category: "quality",
      });
    }

    // Cost metric
    if (
      params.model &&
      params.promptTokens !== undefined &&
      params.completionTokens !== undefined
    ) {
      results.push({
        name: "cost",
        value: this.computeCost(
          params.model,
          params.promptTokens,
          params.completionTokens
        ),
        category: "cost",
      });
    }

    return results;
  }
}

/**
 * Singleton instance of MetricComputer
 */
let _metricComputerInstance: MetricComputer | null = null;

/**
 * Get the singleton MetricComputer instance
 */
export function getMetricComputer(): MetricComputer {
  if (!_metricComputerInstance) {
    _metricComputerInstance = new MetricComputer();
  }
  return _metricComputerInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetMetricComputer(): void {
  _metricComputerInstance = null;
}


/**
 * Metric attachment result
 */
export interface MetricAttachmentResult {
  traceId: string;
  metrics: MetricResult[];
  success: boolean;
  error?: string;
}

/**
 * Attaches computed metrics as feedback scores to a trace
 *
 * Requirements: 5.5
 *
 * @param traceId - The trace ID to attach metrics to
 * @param metrics - Array of computed metrics to attach
 * @param logMetricFn - Function to log metrics to the trace (from OpikClient)
 * @returns Result of the attachment operation
 */
export async function attachMetricsToTrace(
  traceId: string,
  metrics: MetricResult[],
  logMetricFn: (
    traceId: string,
    metric: MetricInput
  ) => Promise<void>
): Promise<MetricAttachmentResult> {
  if (!traceId) {
    return {
      traceId: "",
      metrics: [],
      success: false,
      error: "Invalid trace ID",
    };
  }

  if (!metrics || metrics.length === 0) {
    return {
      traceId,
      metrics: [],
      success: true,
    };
  }

  const attachedMetrics: MetricResult[] = [];
  const errors: string[] = [];

  for (const metric of metrics) {
    try {
      await logMetricFn(traceId, {
        name: metric.name,
        value: metric.value,
        category: metric.category,
      });
      attachedMetrics.push(metric);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      errors.push(`Failed to attach metric ${metric.name}: ${errorMessage}`);
    }
  }

  return {
    traceId,
    metrics: attachedMetrics,
    success: errors.length === 0,
    error: errors.length > 0 ? errors.join("; ") : undefined,
  };
}

/**
 * Computes and attaches all applicable metrics to a trace
 *
 * Requirements: 5.5
 *
 * @param traceId - The trace ID to attach metrics to
 * @param params - Parameters for metric computation
 * @param logMetricFn - Function to log metrics to the trace
 * @returns Result of the attachment operation
 */
export async function computeAndAttachMetrics(
  traceId: string,
  params: {
    input?: string;
    output?: string;
    context?: string[];
    provider?: ServiceAgent;
    alternatives?: ServiceAgent[];
    predictedCategory?: string;
    groundTruthCategory?: string;
    model?: string;
    promptTokens?: number;
    completionTokens?: number;
  },
  logMetricFn: (traceId: string, metric: MetricInput) => Promise<void>
): Promise<MetricAttachmentResult> {
  const computer = getMetricComputer();
  const metrics = computer.computeAllMetrics(params);

  return attachMetricsToTrace(traceId, metrics, logMetricFn);
}

/**
 * In-memory metric store for traces (useful for testing and local development)
 */
const traceMetricStore = new Map<string, MetricResult[]>();

/**
 * Stores metrics for a trace in memory
 *
 * @param traceId - The trace ID
 * @param metrics - Metrics to store
 */
export function storeMetricsForTrace(
  traceId: string,
  metrics: MetricResult[]
): void {
  const existing = traceMetricStore.get(traceId) || [];
  traceMetricStore.set(traceId, [...existing, ...metrics]);
}

/**
 * Retrieves stored metrics for a trace
 *
 * @param traceId - The trace ID
 * @returns Array of metrics for the trace
 */
export function getMetricsForTrace(traceId: string): MetricResult[] {
  return traceMetricStore.get(traceId) || [];
}

/**
 * Clears all stored metrics (useful for testing)
 */
export function clearMetricStore(): void {
  traceMetricStore.clear();
}

/**
 * Gets all trace IDs with stored metrics
 */
export function getTracesWithMetrics(): string[] {
  return Array.from(traceMetricStore.keys());
}
