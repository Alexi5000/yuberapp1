# Math and migration-tool dependency overrides

KaTeX0.18.3 replaces vulnerable0.16.x across Streamdown, rehype-katex and Mermaid. esbuild0.28.2 replaces the vulnerable0.18.x nested dependency in Drizzle's legacy esbuild-kit loader. These overrides preserve the existing application and migration interfaces.

`bun run test:math-tooling` verifies inline/display math through the existing remark/rehype chain, rejects unsafe JavaScript math links, executes a TypeScript fixture through the legacy loader, generates real application migration SQL into a temporary directory, and checks the esbuild development server does not grant a foreign origin access. It does not modify production data or invoke migrations against a database. Existing database tests cover persistence independently.

Keep these overrides until parent packages require patched versions. Recheck both the regression and raw audit before removing them. The remaining audit findings are the legacy Mastra AI SDK dependency paths; this change does not claim their major-version migration is complete.
