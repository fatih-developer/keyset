# Keyset Setup Skill

Use this skill when the user asks to add, configure, repair, or verify an authentication provider in the current project.

## Workflow

1. Inspect the current repository and preserve its architecture/conventions.
2. Use Keyset inspection/plan capabilities before editing files.
3. For provider provisioning, call Keyset rather than manually recreating provider-specific setup logic.
4. Never print or request secrets in normal chat output when Keyset supports secure import/persistence.
5. Apply only the source/config changes required for the detected auth adapter.
6. Run Keyset verification after changes.
7. If Keyset reports a required manual provider-console action, give only that action and continue once the credential/config is available.
8. Keep `.env.example` secret-free.

Prefer concise final reporting: changes, verification, and remaining manual action.
