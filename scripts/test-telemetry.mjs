import assert from 'node:assert/strict';
import { request } from 'node:http';
import { Telemetry } from '@mastra/core/telemetry';
import { NodeSDK, getNodeAutoInstrumentations, resourceFromAttributes } from '@mastra/core/telemetry/otel-vendor';
import { InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { metrics } from '@opentelemetry/api';

const exporter = new InMemorySpanExporter();
const prometheus = new PrometheusExporter({ host: '127.0.0.1', port: 0, preventServerStart: true });
const instrumentations = getNodeAutoInstrumentations();
assert.ok(instrumentations.length > 10);
const sdk = new NodeSDK({
  resource: resourceFromAttributes({ 'service.name': 'yuber-telemetry-regression' }),
  autoDetectResources: false,
  spanProcessors: [new SimpleSpanProcessor(exporter)],
  metricReaders: [prometheus],
  logRecordProcessors: [],
  instrumentations,
});
sdk.start();
await prometheus.startServer();
const port = prometheus._server.address().port;
function get(path) {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port, path }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.end();
  });
}
try {
  const telemetry = Telemetry.init({ serviceName: 'yuber-regression' });
  const success = telemetry.traceMethod(async (value) => value + 1, { spanName: 'successful-job', skipIfNoTelemetry: false });
  assert.equal(await success(41), 42);
  const failure = telemetry.traceMethod(async () => { throw new Error('expected-test-failure'); }, { spanName: 'failed-job', skipIfNoTelemetry: false });
  await assert.rejects(failure(), /expected-test-failure/);
  const spans = exporter.getFinishedSpans();
  const good = spans.find((span) => span.name === 'successful-job');
  const bad = spans.find((span) => span.name === 'failed-job');
  assert.ok(good);
  assert.equal(good.attributes['successful-job.result'], '42');
  assert.equal(bad?.status.code, 2);
  assert.equal(bad?.events[0]?.name, 'exception');
  metrics.getMeter('yuber-test').createCounter('dispatch_requests').add(1);
  assert.equal((await get('http://[invalid')).status, 400);
  const healthy = await get('/metrics');
  assert.equal(healthy.status, 200);
  assert.match(healthy.body, /dispatch_requests_total.*1/);
  console.log('Mastra tracing, error spans, auto-instrumentation, malformed scrape resilience and metrics export passed');
} finally {
  await sdk.shutdown();
}
