# Yuber Documentation

The `docs/` directory contains architecture notes, operational readiness material, diagrams, and screenshot conventions for the Yuber full-stack application.

| Document | Purpose |
|---|---|
| [`PRODUCTION_READINESS.md`](PRODUCTION_READINESS.md) | Release gate, environment contract, health checks, security baseline, and remaining production decisions. |
| [`app_flow_and_agents.mmd`](app_flow_and_agents.mmd) | Mermaid diagram describing the customer flow, AI agents, backend services, and external integrations. |
| [`screenshots/README.md`](screenshots/README.md) | Guidance for storing product screenshots and review assets. |

Before a production release, reviewers should read the production readiness guide, confirm the release gate in `RELEASES.md`, and attach the final CI output or deployment logs to the pull request.
