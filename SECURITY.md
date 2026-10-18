# Security Policy

## Supported Versions

The default branch is the supported security-maintenance target. A passing dependency audit is not a production-security certification.

## Automated checks

Pull requests, pushes to `main`, and a daily scheduled workflow run the regression suite, production build, and an all-severity dependency audit. Audit failures must be repaired rather than hidden with advisory exclusions. Dependabot remains enabled so new updates and security repairs are visible.

Repository secret scanning and secret push protection are enabled. If a credential is exposed, revoke or rotate it at the provider; deleting the file alone is insufficient.

## Production release gate

Before enabling real users, verify identity-provider authentication, per-user authorization, strong session secrets, provider fulfillment, and any payment-provider integration in the deployed environment. Demo authentication and simulated dispatch/payment code are not substitutes for these controls. Use `docs/PRODUCTION_READINESS.md` to track release evidence and unresolved requirements.

## Reporting a Vulnerability

Please do not open public issues for security vulnerabilities.

- Prefer GitHub Security Advisories (private disclosure) if enabled for this repository.
- If advisories are not available, contact the maintainers via their GitHub profiles listed in `CONTRIBUTORS.md`.

When reporting, include:

- A clear description of the issue and impact
- Steps to reproduce
- Any relevant logs or screenshots (redact secrets)


