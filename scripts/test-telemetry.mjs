import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const lock = readFileSync(new URL('../bun.lock', import.meta.url), 'utf8');
for (const name of ['@opentelemetry/sdk-node', '@opentelemetry/exporter-prometheus', '@opentelemetry/auto-instrumentations-node', 'jsondiffpatch', 'sprintf-js']) {
  assert.ok(!lock.includes(`"${name}@`), `${name} must not remain in the resolved graph`);
}
const { Mastra } = await import('@mastra/core');
assert.ok(new Mastra({ agents: {}, workflows: {} }));
console.log('Mastra initialization passes; removed legacy telemetry/parser dependencies stay absent');
