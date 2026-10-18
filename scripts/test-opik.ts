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
  assert.ok(requests.some(({ path }) => path.includes('traces')));
  assert.ok(requests.some(({ path }) => path.includes('spans')));
  const payloads = JSON.stringify(requests);
  assert.ok(payloads.includes('triage'));
  assert.ok(payloads.includes('lookup'));
  assert.ok(payloads.includes('plumbing'));
  assert.ok(payloads.includes('category'));
  assert.ok(payloads.includes('found'));
  const disabled = new OpikClient({ ...config, enabled: false });
  await disabled.initialize();
  assert.equal(await disabled.createTrace({ name: 'disabled' }), null);
  await disabled.shutdown();
  console.log('PASS: Opik trace/span export, completion, flush, disabled tracing');
} finally {
  await client.shutdown();
  server.stop(true);
}
