# Release checklist

Run the release gate from a clean checkout:

```bash
npm ci
npm run check
npm run format:check
npm test
npm run test:coverage
npm run test:e2e
npm run public-audit:release
npm run build -- --version 1.0.0 --output ./output/codex-work-platform-1.0.0-portable
npm run verify-release -- ./output/codex-work-platform-1.0.0-portable
```

The build writes `p10-release.json`, whose manifest SHA-256 and tree SHA-256
are the release identity. Existing output directories are moved to a uniquely
named `.previous-*` sibling; the builder does not prune those archives.

GitHub Actions repeats the checks on Linux, Windows, and macOS arm64 runners
and publishes one tarball plus a `.sha256` sidecar per runner. A passing CI
job is not a substitute for a physical-device installation; that acceptance
must be reported separately.

The vendored compatibility runtime is released only when
`vendor/compat-runtime/SOURCES.json` and
`vendor/compat-runtime/THIRD_PARTY_NOTICES.md` pass the public audit. The
current bundle is byte-verified but has no recovered upstream checkout, so it
is explicitly not described as a fully reproducible source build.
