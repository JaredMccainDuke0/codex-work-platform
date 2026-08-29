# Third-party notices

The compatibility runtime is distributed as a local vendor bundle. The
original checkout did not include a dependency lock file, so the exact
embedded package versions are not encoded in the artifact. The following
package names, source repositories, and SPDX identifiers were audited against
the npm registry on 2026-08-29. `SOURCES.json` records the bundle SHA-256 and
does not claim an upstream commit that was not available.

| Package | Embedded version | SPDX | Source |
| --- | --- | --- | --- |
| `@modelcontextprotocol/sdk` | not encoded | MIT | https://github.com/modelcontextprotocol/typescript-sdk |
| `ajv` | not encoded | MIT | https://github.com/ajv-validator/ajv |
| `ajv-formats` | not encoded | MIT | https://github.com/ajv-validator/ajv-formats |
| `fast-deep-equal` | not encoded | MIT | https://github.com/epoberezkin/fast-deep-equal |
| `fast-uri` | not encoded | BSD-3-Clause | https://github.com/fastify/fast-uri |
| `json-schema-traverse` | not encoded | MIT | https://github.com/epoberezkin/json-schema-traverse |
| `sql.js` | not encoded | MIT | https://github.com/sql-js/sql.js |
| `zod` | not encoded | MIT | https://github.com/colinhacks/zod |
| `zod-to-json-schema` | not encoded | ISC | https://github.com/StefanTerdell/zod-to-json-schema |

Each package retains its upstream license terms. The bundle may also contain
transitive code; contributors must update this file and `SOURCES.json` when a
new vendor artifact is introduced. A future release should replace
“not encoded” with lock-file versions once the original build checkout is
recovered or the bundle is rebuilt from a documented source tree.
