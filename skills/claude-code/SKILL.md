# Keyset Setup Skill

Use Keyset as the source of truth for authentication-provider provisioning and verification.

## Instructions

- Analyze the current repository before mutation.
- Plan provider setup before executing it.
- Delegate provider-side provisioning to Keyset MCP/CLI.
- Do not duplicate provider provisioning logic in shell scripts or prompts.
- Never expose provider secrets in responses, logs, documentation, or commits.
- Make minimal project changes for the detected auth adapter.
- Verify after setup.
- Clearly report any unavoidable manual provider-console step.
