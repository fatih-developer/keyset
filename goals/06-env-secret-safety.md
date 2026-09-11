# Goal 06 — Environment and Secret Safety

## Goal

Implement safe local credential persistence and environment-file mutation.

## Support

- `.env`
- `.env.local`
- `.env.development`
- `.env.production`
- `.env.example`

## Requirements

- No duplicate keys.
- Preserve unrelated entries/comments where practical.
- Real secrets never go to `.env.example`.
- Ensure chosen secret file is ignored by Git or raise a blocking finding.
- Add dry-run diff output with secret values redacted.
- Atomic writes where practical.
- Path traversal protection.

## Secret Keys for Google

Support adapter-provided names rather than hard-coding only one convention. Provide sensible defaults such as:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Tests

Cover existing files, missing files, duplicate entries, Git-tracked env files, and dry-run output.
