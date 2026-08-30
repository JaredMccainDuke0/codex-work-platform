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
node scripts/check-version.mjs --tag v1.0.1
npm run build:clean
npm run verify-release
```

The build writes `p10-release.json`, whose manifest SHA-256 and tree SHA-256
are the release identity. Text sources are canonicalized to LF so a Windows
checkout and a Unix checkout produce the same manifest. A normal manual build
keeps at most one recoverable `.previous-*` sibling; `build:clean` retains none,
so repeated release checks do not accumulate obsolete packages.

GitHub Actions repeats the checks on Linux, Windows, and macOS arm64 runners
and publishes one tarball plus a `.sha256` sidecar per runner. A passing CI
job is not a substitute for a physical-device installation; that acceptance
must be reported separately.

The vendored compatibility runtime is released only when
`vendor/compat-runtime/SOURCES.json` and
`vendor/compat-runtime/THIRD_PARTY_NOTICES.md` pass the public audit. The
current bundle is byte-verified but has no recovered upstream checkout, so it
is explicitly not described as a fully reproducible source build.
