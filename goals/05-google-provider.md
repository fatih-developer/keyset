# Goal 05 — Google OAuth Provider

## Goal

Implement the Google provider adapter using official supported Google Cloud tooling/APIs where available and guided setup for unsupported provisioning steps.

## Critical Rule

Do not pretend an operation is API-automatable if Google does not expose a supported API for the required standard OAuth client workflow.

## Implement

- prerequisite detection for Google tooling/credentials
- account/project context detection where supported
- required authorized origins
- required redirect URIs
- provider setup plan
- capability reporting per operation
- guided manual-action object with concise instructions and provider-console target when necessary
- secure import of OAuth client credentials from supported input forms
- provider configuration validation where technically available

## Credentials

Extract client ID and client secret into secret-aware internal values.

Never log or return the client secret.

## Tests

Mock external Google calls. Unit tests must not require a real Google account.
