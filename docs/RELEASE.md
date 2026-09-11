# Release procedure

This is the release checklist for maintainers. The packages are public-ready
at version 1.0.0; tagging and registry publication remain maintainer actions.

## Before tagging

1. Confirm the compatibility matrix and update [Compatibility](COMPATIBILITY.md).
2. Read `SECURITY.md` and complete the security-owned release gates.
3. Run the repository checks:

   ```bash
   npm install
   npm run verify
   ```

4. Build every package and inspect each tarball with `npm pack --dry-run`.
   Confirm `dist`, license, README/package metadata, bins, and no fixtures,
   environment files, logs, or secrets are included.
5. Install the release candidate in a clean temporary directory and run the
   required smoke test:

   ```bash
   keyset --version
   keyset providers
   keyset setup google --dry-run
   keyset-mcp
   ```

   The packed smoke harness runs these checks without the monorepo:
   `npm run test:packed`.

6. Run the full validated compatibility and secret-sentinel suites. Do not
   publish if a mandatory gate fails.

7. Build a reproducible local release candidate with `npm run release:rc`.
   It writes package tarballs and a SHA-256 manifest to `release-artifacts/`;
   inspect those files before attaching them to a GitHub Release.

## Tag and GitHub release

After approval, create an annotated semantic-version tag and push it:

```bash
git tag -a v1.0.0 -m "Keyset v1.0.0"
git push origin v1.0.0
```

Create a GitHub Release for that tag with release notes containing the tested
matrix, migration notes, known limitations, and artifact checksums. Attach
package artifacts and SBOM/provenance outputs when the release pipeline
provides them.

## Registry publication

Verify package names, ownership, access, and publish configuration before
running `npm publish`. Use trusted publishing/provenance where the registry
supports it. Tokens must come from the maintainer’s local credential store or
protected release environment; never place them in this repository.

All publishable package manifests use version 1.0.0, include repository and
license metadata, and are audited by `scripts/security/package-audit.mjs`.
