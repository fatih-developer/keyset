# Goal 04 — Better Auth and Auth.js Adapters

## Goal

Implement application-side auth adapters.

## Better Auth

Detect existing installation/configuration and determine the Google callback convention from the actual project setup.

Support idempotent provider config changes with minimal edits.

## Auth.js

Detect existing installation/configuration and determine the Google callback convention from the actual project setup.

Support idempotent provider config changes with minimal edits.

## Shared Requirements

- Calculate development and production callback URLs.
- Detect existing Google provider configuration.
- Generate env variable requirements.
- Never write secret values into source files.
- Preserve repository conventions.
- Avoid formatting unrelated files.

## Tests

Use fixture repositories and snapshot only stable normalized outputs, not fragile full-file formatting where unnecessary.
