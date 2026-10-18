# OpenTelemetry dependency compatibility

Mastra 0.24.9 pins its experimental OpenTelemetry packages to the older 0.203 series and auto-instrumentations 0.62. Root overrides align the SDK, HTTP/gRPC trace exporters, exporter base and transformer at 0.223.0, with auto-instrumentations 0.81.2. The resolved stable SDK packages remain on the supported 2.x line (2.12.0).

This removes the vulnerable Prometheus request parser, older Jaeger propagator, unbounded baggage allocation and instrumentation packages that expose database usernames. The application retains its Mastra and AI SDK interfaces; this does not complete the separate Mastra 1.x migration.

`bun run test:telemetry` exercises Mastra's published OTel vendor exports and Telemetry wrapper with the real NodeSDK. It verifies successful async traces, exception spans, auto-instrumentation construction, a malformed Prometheus request returning 400, and a subsequent healthy scrape with a real counter. The test binds only loopback on an ephemeral port and exports traces in memory, with no provider credentials. CI runs this alongside existing regressions.

Remove these overrides only when the parent dependency supplies a patched compatible cohort; rerun the telemetry regression and raw audit. Live cloud exporters and legacy application agents remain outside this offline check. The pre-existing absent `@/store` contract and excluded Mastra source still block validating those agents and merging their major-version upgrades.

References:
- https://opentelemetry.io/docs/languages/js/getting-started/nodejs/
- https://github.com/advisories/GHSA-q7rr-3cgh-j5r3
- https://github.com/advisories/GHSA-8988-4f7v-96qf
- https://github.com/advisories/GHSA-qqmp-wf37-98f9
