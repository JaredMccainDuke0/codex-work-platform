# Data migration

On startup, the control service looks for the legacy sidecar next to the
formal compatibility database:

```text
platform.sqlite.p10.json
```

If no `control.sqlite` records exist, it validates and imports the sidecar in
one transaction. The control database records the schema and migration in
`p10_meta` and `p10_migrations`; the original bytes are copied to a timestamped
local `.legacy-*` file, and the sidecar is replaced with a redacted export.
The formal `platform.sqlite` file is not rewritten by this migration.

To inspect or export the new control state without starting the services:

```text
node release/bin/platform-manager.mjs export-state \
  --install-root <install-root> --target <output-json>
```

Keep the pre-migration backup until the imported counts and event sequences
have been checked. A migration error is fatal and leaves the source files in
place for diagnosis.
