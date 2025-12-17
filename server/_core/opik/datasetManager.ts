/**
 * DatasetManager Module
 *
 * Manages evaluation datasets for offline testing and experiments.
 * Supports creating datasets with input-output pairs and ground truth,
 * running experiments, and computing aggregate metrics.
 *
 * @module opik/datasetManager
 */

import type { DatasetItem } from "./schemas";

/**
 * Dataset containing items for evaluation
 */
export interface Dataset {
  name: string;
  items: DatasetItem[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Result of running an experiment on a single dataset item
 */
export interface ItemResult {
  itemId: string;
  input: unknown;
  expectedOutput?: unknown;
  actualOutput: unknown;
  metrics: Record<string, number>;
  success: boolean;
  error?: string;
  durationMs: number;
}

/**
 * Aggregate metrics computed across all dataset items
 */
export interface AggregateMetrics {
  count: number;
  successRate: number;
  metrics: Record<string, {
    mean: number;
    std: number;
    min: number;
    max: number;
  }>;
}

/**
 * Result of running an experiment
 */
export interface ExperimentResult {
  datasetName: string;
  runId: string;
  timestamp: Date;
  metrics: AggregateMetrics;
  itemResults: ItemResult[];
}

/**
 * Function type for experiment runners
 * Takes an input and returns output with metrics
 */
export type ExperimentRunner = (
  input: unknown
) => Promise<{ output: unknown; metrics: Record<string, number> }>;

/**
 * In-memory dataset storage
 */
const datasetStore: Map<string, Dataset> = new Map();


/**
 * DatasetManager class
 *
 * Handles creation, storage, and management of evaluation datasets.
 * Supports running experiments and computing aggregate metrics.
 *
 * Requirements: 7.1, 7.2, 7.3
 */
export class DatasetManager {
  /**
   * Create a new dataset with input-output pairs
   *
   * Requirements: 7.1
   *
   * @param name - Unique name for the dataset
   * @param items - Array of dataset items with input, expectedOutput, and groundTruth
   * @returns The created dataset
   */
  createDataset(name: string, items: DatasetItem[]): Dataset {
    const now = new Date();
    const dataset: Dataset = {
      name,
      items: [...items],
      createdAt: now,
      updatedAt: now,
    };

    datasetStore.set(name, dataset);
    return dataset;
  }

  /**
   * Get a dataset by name
   *
   * @param name - Name of the dataset to retrieve
   * @returns The dataset or undefined if not found
   */
  getDataset(name: string): Dataset | undefined {
    return datasetStore.get(name);
  }

  /**
   * Add an item to an existing dataset
   *
   * @param datasetName - Name of the dataset to add to
   * @param item - Item to add
   * @returns true if item was added, false if dataset not found
   */
  addItem(datasetName: string, item: DatasetItem): boolean {
    const dataset = datasetStore.get(datasetName);
    if (!dataset) {
      return false;
    }

    dataset.items.push(item);
    dataset.updatedAt = new Date();
    return true;
  }

  /**
   * Delete a dataset
   *
   * @param name - Name of the dataset to delete
   * @returns true if deleted, false if not found
   */
  deleteDataset(name: string): boolean {
    return datasetStore.delete(name);
  }

  /**
   * List all dataset names
   *
   * @returns Array of dataset names
   */
  listDatasets(): string[] {
    return Array.from(datasetStore.keys());
  }

  /**
   * Run an experiment against all items in a dataset
   *
   * Requirements: 7.2
   *
   * @param datasetName - Name of the dataset to run against
   * @param runner - Function to execute for each item
   * @returns Experiment result with item results and aggregate metrics
   */
  async runExperiment(
    datasetName: string,
    runner: ExperimentRunner
  ): Promise<ExperimentResult | undefined> {
    const dataset = datasetStore.get(datasetName);
    if (!dataset) {
      return undefined;
    }

    const runId = crypto.randomUUID();
    const itemResults: ItemResult[] = [];

    for (const item of dataset.items) {
      const startTime = Date.now();
      let result: ItemResult;

      try {
        const { output, metrics } = await runner(item.input);
        const durationMs = Date.now() - startTime;

        result = {
          itemId: item.id,
          input: item.input,
          expectedOutput: item.expectedOutput,
          actualOutput: output,
          metrics,
          success: true,
          durationMs,
        };
      } catch (error) {
        const durationMs = Date.now() - startTime;
        result = {
          itemId: item.id,
          input: item.input,
          expectedOutput: item.expectedOutput,
          actualOutput: null,
          metrics: {},
          success: false,
          error: error instanceof Error ? error.message : String(error),
          durationMs,
        };
      }

      itemResults.push(result);
    }

    const aggregateMetrics = computeAggregateMetrics(itemResults);

    return {
      datasetName,
      runId,
      timestamp: new Date(),
      metrics: aggregateMetrics,
      itemResults,
    };
  }

  /**
   * Clear all datasets (useful for testing)
   */
  clearAll(): void {
    datasetStore.clear();
  }
}


/**
 * Compute aggregate metrics from item results
 *
 * Requirements: 7.3
 *
 * @param itemResults - Array of item results from an experiment
 * @returns Aggregate metrics with mean, std, min, max for each metric
 */
export function computeAggregateMetrics(itemResults: ItemResult[]): AggregateMetrics {
  const count = itemResults.length;

  if (count === 0) {
    return {
      count: 0,
      successRate: 0,
      metrics: {},
    };
  }

  const successCount = itemResults.filter((r) => r.success).length;
  const successRate = successCount / count;

  // Collect all metric names
  const metricNames = new Set<string>();
  for (const result of itemResults) {
    for (const name of Object.keys(result.metrics)) {
      metricNames.add(name);
    }
  }

  // Compute aggregate for each metric
  const metrics: Record<string, { mean: number; std: number; min: number; max: number }> = {};

  for (const name of metricNames) {
    const values: number[] = [];
    for (const result of itemResults) {
      if (name in result.metrics) {
        values.push(result.metrics[name]);
      }
    }

    if (values.length > 0) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance =
        values.length > 1
          ? values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length
          : 0;
      const std = Math.sqrt(variance);
      const min = Math.min(...values);
      const max = Math.max(...values);

      metrics[name] = { mean, std, min, max };
    }
  }

  return {
    count,
    successRate,
    metrics,
  };
}

/**
 * Singleton instance of DatasetManager
 */
let _managerInstance: DatasetManager | null = null;

/**
 * Get the singleton DatasetManager instance
 */
export function getDatasetManager(): DatasetManager {
  if (!_managerInstance) {
    _managerInstance = new DatasetManager();
  }
  return _managerInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetDatasetManager(): void {
  if (_managerInstance) {
    _managerInstance.clearAll();
  }
  _managerInstance = null;
}
