import assert from 'node:assert/strict';
import { OpikClient } from '../server/_core/opik/client';

const requests: { path: string; body: unknown }[] = [];
const server = Bun.serve({
  hostname: '127.0.0.1',
  port: 0,
  async fetch(request) {
    const path = new URL(request.url).pathname;
    if (request.method === 'GET') return Response.json({ status: 'healthy' });
    requests.push({ path, body: await request.json() });
    return new Response(null, { status: 204 });
  },
});
const config = {
  url: `http://127.0.0.1:${server.port}`,
  projectName: 'sdk-regression',
  workspace: 'test',
  enabled: true,
  sampleRate: 1,
  retryAttempts: 1,
  retryDelayMs: 1,
};
const client = new OpikClient(config);
try {
  await client.initialize();
  assert.equal(client.isHealthy(), true);
  const trace = await client.createTrace({ name: 'triage', input: { issue: 'plumbing' } });
  assert.ok(trace);
  const span = await client.createSpan(trace.id, { name: 'lookup', type: 'tool', input: { query: 'plumber' } });
  assert.ok(span);
  await client.endSpan(span.id, { output: { found: 1 }, status: 'success' });
  await client.endTrace(trace.id, { output: { category: 'plumbing' }, status: 'success' });
  await client.shutdown();
  const traces = requests.flatMap(({ body }) => (body as { traces?: Record<string, unknown>[] }).traces ?? []);
  const spans = requests.flatMap(({ body }) => (body as { spans?: Record<string, unknown>[] }).spans ?? []);
  assert.equal(traces.length, 1);
  assert.equal(spans.length, 1);
  assert.equal(traces[0]!.name, 'triage');
  assert.deepEqual(traces[0]!.input, { issue: 'plumbing' });
  assert.deepEqual(traces[0]!.output, { category: 'plumbing' });
  assert.equal(spans[0]!.name, 'lookup');
  assert.deepEqual(spans[0]!.output, { found: 1 });
  assert.equal(spans[0]!.trace_id, traces[0]!.id);
  assert.ok(traces[0]!.end_time);
  assert.ok(spans[0]!.end_time);
  const disabled = new OpikClient({ ...config, enabled: false });
  await disabled.initialize();
  assert.equal(await disabled.createTrace({ name: 'disabled' }), null);
  await disabled.shutdown();
  console.log('PASS: Opik trace/span export, completion, flush, disabled tracing');
} finally {
  await client.shutdown();
  server.stop(true);
}
