// file: server/_core/logger.ts
// description: Minimal structured logger wrapper for server modules (used by Opik monitoring helpers)
// reference: server/_core/opik/alerting.ts, server/_core/env.ts

type LogMeta = Record<string, unknown>;

type LogFn = (message: string, meta?: LogMeta) => void;

function formatLog(level: string, message: string, meta?: LogMeta): unknown[] {
  if (!meta) return [`[${level}] ${message}`];
  return [`[${level}] ${message}`, meta];
}

const info: LogFn = (message, meta) => console.info(...formatLog('INFO', message, meta));
const warn: LogFn = (message, meta) => console.warn(...formatLog('WARN', message, meta));
const error: LogFn = (message, meta) => console.error(...formatLog('ERROR', message, meta));
const debug: LogFn = (message, meta) => console.debug(...formatLog('DEBUG', message, meta));

export const logger = {
  system: { info, warn, error, debug },
} as const;


