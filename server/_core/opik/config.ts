// file: server/_core/opik/config.ts
// description: Reads Opik tracing configuration from environment variables and applies defaults/clamping
// reference: server/_core/opik/constants.ts, server/_core/opik/client.ts

/**
 * Opik Configuration Module
 *
 * Reads Opik configuration from environment variables and provides
 * sensible defaults for invalid or missing values.
 *
 * @module opik/config
 */

import {
  DEFAULT_OPIK_PROJECT_NAME,
  DEFAULT_SAMPLE_RATE,
  DEFAULT_RETRY_ATTEMPTS,
  DEFAULT_RETRY_DELAY_MS,
  MIN_SAMPLE_RATE,
  MAX_SAMPLE_RATE,
} from "./constants";

/**
 * Configuration interface for the Opik client
 */
export interface OpikClientConfig {
  /** Self-hosted Opik server URL */
  url: string;
  /** Project identifier for grouping traces */
  projectName: string;
  /** Optional workspace for organization */
  workspace: string | undefined;
  /** Feature flag to enable/disable tracing */
  enabled: boolean;
  /** Sampling rate for traces (0.0 to 1.0) */
  sampleRate: number;
  /** Maximum retry attempts for network errors */
  retryAttempts: number;
  /** Initial retry delay in milliseconds */
  retryDelayMs: number;
}

/** Default configuration values */
const DEFAULTS = {
  url: "",
  projectName: DEFAULT_OPIK_PROJECT_NAME,
  workspace: undefined,
  enabled: true,
  sampleRate: DEFAULT_SAMPLE_RATE,
  retryAttempts: DEFAULT_RETRY_ATTEMPTS,
  retryDelayMs: DEFAULT_RETRY_DELAY_MS,
} as const;

/**
 * Parses a boolean from an environment variable string
 * @param value - The string value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed boolean or default
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value === "") {
    return defaultValue;
  }
  const normalized = value.toLowerCase().trim();
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }
  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }
  console.warn(
    `[Opik Config] Invalid boolean value "${value}" for OPIK_ENABLED, using default: ${defaultValue}`
  );
  return defaultValue;
}

/**
 * Parses a sample rate from an environment variable string
 * @param value - The string value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed sample rate (clamped to 0.0-1.0) or default
 */
function parseSampleRate(value: string | undefined, defaultValue: number): number {
  if (value === undefined || value === "") {
    return defaultValue;
  }
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    console.warn(
      `[Opik Config] Invalid sample rate "${value}" for OPIK_SAMPLE_RATE, using default: ${defaultValue}`
    );
    return defaultValue;
  }
  if (parsed < MIN_SAMPLE_RATE || parsed > MAX_SAMPLE_RATE) {
    console.warn(
      `[Opik Config] Sample rate ${parsed} out of range [${MIN_SAMPLE_RATE}, ${MAX_SAMPLE_RATE}] for OPIK_SAMPLE_RATE, clamping to valid range`
    );
    return Math.max(MIN_SAMPLE_RATE, Math.min(MAX_SAMPLE_RATE, parsed));
  }
  return parsed;
}

/**
 * Reads Opik configuration from environment variables
 *
 * Environment variables:
 * - OPIK_URL: Self-hosted Opik server URL (required for tracing to work)
 * - OPIK_PROJECT_NAME: Project name for grouping traces (default: "yuber-default")
 * - OPIK_WORKSPACE: Optional workspace identifier
 * - OPIK_ENABLED: Enable/disable tracing (default: true)
 * - OPIK_SAMPLE_RATE: Trace sampling rate 0.0-1.0 (default: 1.0)
 *
 * @returns OpikClientConfig with values from environment or defaults
 */
export function readOpikConfig(): OpikClientConfig {
  const url = process.env.OPIK_URL?.trim() || DEFAULTS.url;
  const projectName = process.env.OPIK_PROJECT_NAME?.trim() || DEFAULTS.projectName;
  const workspace = process.env.OPIK_WORKSPACE?.trim() || DEFAULTS.workspace;
  const enabled = parseBoolean(process.env.OPIK_ENABLED, DEFAULTS.enabled);
  const sampleRate = parseSampleRate(process.env.OPIK_SAMPLE_RATE, DEFAULTS.sampleRate);

  // Log warnings for missing critical configuration
  if (!url) {
    console.warn(
      "[Opik Config] OPIK_URL not configured. Tracing will be disabled."
    );
  }

  if (!process.env.OPIK_PROJECT_NAME) {
    console.warn(
      `[Opik Config] OPIK_PROJECT_NAME not configured, using default: "${DEFAULTS.projectName}"`
    );
  }

  return {
    url,
    projectName,
    workspace,
    enabled,
    sampleRate,
    retryAttempts: DEFAULTS.retryAttempts,
    retryDelayMs: DEFAULTS.retryDelayMs,
  };
}

/**
 * Validates if the configuration is sufficient for tracing
 * @param config - The configuration to validate
 * @returns true if tracing can be enabled, false otherwise
 */
export function isTracingEnabled(config: OpikClientConfig): boolean {
  return config.enabled && config.url !== "";
}

/**
 * Default configuration instance (lazy-loaded)
 */
let _cachedConfig: OpikClientConfig | null = null;

/**
 * Gets the current Opik configuration (cached)
 * @returns The current OpikClientConfig
 */
export function getOpikConfig(): OpikClientConfig {
  if (!_cachedConfig) {
    _cachedConfig = readOpikConfig();
  }
  return _cachedConfig;
}

/**
 * Resets the cached configuration (useful for testing)
 */
export function resetConfigCache(): void {
  _cachedConfig = null;
}
