# Goal 09 — Doctor and Verify

## Goal

Implement diagnostics that make Keyset useful even for projects it did not originally configure.

## Doctor Checks

At minimum detect:

- auth library not detected
- missing provider config
- missing client ID
- missing client secret
- secret env file not Git-ignored
- callback mismatch
- localhost port mismatch
- missing production URL
- duplicate env entries
- invalid Keyset state
- provider-side manual action still required

## Verify

`keyset verify google` should return normalized verification checks and CI exit codes defined in the PRD.

## Auto-fix

Only mark `autoFixAvailable=true` for deterministic and low-risk fixes. Do not silently perform them from `doctor`.
