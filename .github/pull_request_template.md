## Summary

<!-- What changed and why? -->

## Security and release checklist

- [ ] I used only fake credentials such as `KEYSET_TEST_ONLY_SENTINEL`.
- [ ] I did not add arbitrary shell execution or unrestricted file writes.
- [ ] I considered path, symlink, subprocess, MCP, provider and secret boundaries where applicable.
- [ ] I ran `npm run verify`.
- [ ] I ran `node scripts/security/secret-sentinel.mjs --scan` and the security tests when applicable.
- [ ] I checked that logs, diffs, snapshots, tarballs and artifacts contain no secrets.
- [ ] I documented migration, rollback and release impact where applicable.

## Tests run

<!-- List exact commands and results. -->
