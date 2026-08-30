# Contributing

1. Create a focused branch from `main`.
2. Do not commit databases, runtime state, credentials, private project files,
   screenshots containing local paths, or complete chat transcripts.
3. Run `npm ci`, `npm run check`, `npm run format:check`, `npm test`,
   `npm run test:coverage`, and `npm run public-audit:release`.
4. For UI changes, run the Playwright smoke flow at desktop and 390px widths.
5. Explain migration, security, compatibility, and visual-QA limits in the
   pull request.

Behavior changes must include a regression test. Changes to the vendored
compatibility runtime must update its provenance and third-party notice files.
Control-service infrastructure belongs under `server/`; extraction commits
must preserve the existing HTTP, event, database, and rollback contracts.

The coverage command enforces at least 90% line and 80% branch coverage for
the deterministic state, validation, and workflow-core modules. The full
integration report remains available as `npm run test:coverage:all`; process,
CLI, and browser adapters are validated by their dedicated integration tests.
