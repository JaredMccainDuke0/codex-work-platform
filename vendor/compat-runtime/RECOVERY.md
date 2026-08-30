# Compatibility runtime source recovery

## Current conclusion

The retained compatibility runtime is a byte-verified executable artifact, not
a recovered source checkout. On 2026-08-30 the following locations and signals
were checked without finding the original repository, lockfile, source map, or
build configuration:

- every commit and path in this repository;
- adjacent local project directories retained after the open-source migration;
- public GitHub code and repository search using the bundle-only identifiers
  `BUILD_MANIFEST_VERSION_MISMATCH`, `PROJECT_BOOTSTRAP`, and
  `packages/project-brief/src/index.ts`;
- bundle trailers and source-map markers.

The deleted pre-open-source copies contained the same runtime bundle, not an
independent TypeScript checkout. Restoring those copies would therefore not
restore provenance.

## Evidence still present

The generated bundle contains module-boundary comments that identify the former
monorepo layout:

- `packages/contracts/src/index.ts`
- `packages/kernel/src/index.ts`
- `packages/ui-adapter/src/index.ts`
- `packages/project-brief/src/index.ts`
- `packages/lifecycle/src/index.ts`
- `packages/codex-adapter/src/index.ts`
- `packages/task-sync/src/index.ts`
- `packages/context-pack/src/index.ts`
- `packages/long-task/src/index.ts`
- `packages/search-knowledge/src/index.ts`
- `packages/official-info/src/index.ts`
- `packages/cli/src/index.ts`
- `packages/cli/src/main.ts`

These comments establish former module names only. They do not establish a
commit, package version, author, license provenance, or reproducible build.

## What counts as a successful recovery

A future recovery may change `provenanceLevel` only after it provides:

1. a repository URL and immutable commit SHA;
2. the package manifest and dependency lockfile;
3. the Node.js and package-manager versions;
4. a documented build command and source license files;
5. a generated SBOM with exact dependency versions;
6. successful execution of the replacement contract in `CONTRACT.md`;
7. new bundle hashes recorded in `SOURCES.json`.

Formatting or de-minifying the existing bundle does not satisfy these
requirements and must not be presented as recovered source.
