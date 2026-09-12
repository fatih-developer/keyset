# Keyset landing page brief

## Purpose of this document

This document is the source brief for the Keyset marketing website. It is
written for the web implementation team and contains positioning, page copy,
product details, package responsibilities, technical proof points, SEO
content, FAQ answers, and visual direction.

The landing page should sell one clear idea:

> Configure OAuth in an existing web application without copying credentials
> through chat, logs, or source files.

The page may introduce the wider developer automation product family as a
future direction, but the current product offer is Keyset and its OAuth
packages. Do not present database, deployment, payments, email, or general
infrastructure automation as current Keyset functionality.

## 1. Page outline

### Primary audience

- Developers building Next.js applications.
- Teams using Better Auth, Auth.js, or NextAuth.js.
- Coding agents that need a bounded, typed OAuth workflow.
- Developers who repeatedly configure Google or GitHub login across projects.
- Maintainers who need to diagnose callback and environment mistakes quickly.

### Visitor problem

OAuth setup is not only a login button. It involves a provider console, consent
settings, test users, callback URLs, environment variables, auth library code,
and runtime verification. A small mismatch can produce an opaque sign in
failure. Developers often move secrets through terminals, chat, screenshots,
or source files while trying to solve it.

### Product promise

Keyset turns that setup into a project aware, repeatable workflow. It inspects
the application, plans the provider configuration, applies only the required
changes, protects credential values, and verifies the real authorization
redirect.

### Primary conversion

Install the CLI and run the first OAuth inspection.

Primary CTA label:

```text
Install Keyset
```

Primary CTA destination:

```text
https://github.com/fatih-developer/keyset
```

Secondary action:

```text
Read the OAuth guide
```

The secondary action may link to the repository documentation. Do not place a
competing signup, newsletter, or demo CTA above the fold.

### Recommended layout

Use layout A, classic hero plus sections. The product is easiest to understand
through a terminal and project configuration visual, while the middle sections
can explain trust, workflow, package boundaries, and supported integrations.

## 2. Hero copy

### Eyebrow

```text
OAuth setup for web applications
```

### Headline

```text
Ship OAuth without the setup maze
```

Alternative headline for testing:

```text
Configure web OAuth without leaking credentials
```

### Subheadline

```text
Keyset inspects your existing web application, configures Google or GitHub,
writes the right environment variables, updates your auth adapter, and verifies
the callback flow through one repeatable workflow.
```

### Primary CTA

```text
Install Keyset
```

### CTA helper text

```text
Open source. Node.js 20 or newer. Works from the command line or through MCP.
```

### Proof line

```text
Built for Next.js, Better Auth, Auth.js, and agent assisted development.
```

### Hero visual

Show a composed split visual:

1. A dark terminal panel with the command `keyset inspect`.
2. A structured inspection result showing framework, auth library, provider,
   callback URL, and environment target.
3. A second command, `keyset setup google --auto`, with redacted output.
4. A small status panel reading `OAuth redirect verified`.

The visual must never show a real client ID, secret, email address, filesystem
path belonging to a real person, or browser session cookie.

Suggested terminal copy:

```text
$ keyset inspect
Framework       Next.js
Auth library    Better Auth
Provider        Google OAuth
Origin          http://localhost:3000
Callback        /api/auth/callback/google
Environment     .env.local

$ keyset verify google --runtime
Configuration verified
Authorization redirect verified
Secrets redacted
```

## 3. Benefits

Use four benefit cards. Each card needs an outcome first and a short proof
sentence second.

### Project aware setup

**Start from the application you already have**

Keyset detects the framework, package manager, development port, auth route,
environment files, and existing provider configuration before it plans a
change.

### Safer credential handling

**Keep client secrets out of chat and source code**

Credential values are wrapped in a redacting type, written only to the
appropriate environment target, and excluded from CLI and MCP output.

### Repeatable auth changes

**Run the same setup twice without duplicate providers**

Setup is idempotent. Existing Google or GitHub providers are preserved, and a
configured project returns a safe already configured result instead of creating
unnecessary clients or source changes.

### Verification that follows the redirect

**Find callback mistakes before users do**

Static, semantic, and optional runtime checks validate origins, redirect URIs,
provider configuration, and the actual local authorization redirect.

## 4. Tagline reveal section

Place this section after the benefits. It must be a large standalone moment,
not another feature card.

```text
OAuth is a chain of small configuration decisions.
Keyset makes every link visible, repeatable, and safe to verify.
```

Reveal each word individually as it enters the viewport. Start the words in a
muted tone and resolve them to the full text color using the site motion rules.

## 5. How it works

Use three steps with a short command example in each step.

### Step one: inspect

```text
keyset inspect
```

Keyset reads project facts without executing application code. It identifies
the supported framework and auth adapter, maps the environment, and calculates
the expected OAuth origins and callback URLs.

### Step two: configure

```text
keyset setup google --auto
```

Keyset creates a setup plan, guides the provider operation, imports or creates
the credentials through the safest available path, writes the correct
environment variables, and updates the auth adapter without removing existing
providers.

For Google Console operations, the user remains in control of login, MFA,
project selection, consent, and any provider approval. Keyset never asks for a
Google password and never claims to bypass Google security controls.

### Step three: verify

```text
keyset verify google --runtime
```

Keyset checks configuration and, when requested, starts the trusted local
application on a temporary available port to inspect the authorization
redirect. It reports actionable errors with redacted output.

## 6. Product capabilities

### Application inspection

Keyset can identify:

- Next.js project shape.
- Better Auth or Auth.js configuration.
- npm, pnpm, yarn, or Bun usage.
- Development port and application origin.
- Auth route and callback conventions.
- Existing provider entries.
- Environment file locations and ignore status.
- Whether the project is safe to mutate under the selected command.

### Provider setup

Current provider surface:

- Google Web OAuth.
- GitHub OAuth App credentials.

Google can use a user authorized Chrome Console flow for Web client creation.
GitHub provisioning is currently guided, while existing credentials can be
imported and validated.

### Auth integration

Keyset does not replace an application’s authentication library. It configures
the provider integration already used by the application.

Supported adapters:

- Better Auth.
- Auth.js and NextAuth.js compatible project shapes.

The adapters preserve existing providers, add only the requested integration,
avoid duplicate entries, and roll back local changes when post setup
verification fails.

### Environment handling

The system writes provider specific names to the intended environment file:

```text
Better Auth   GOOGLE_CLIENT_ID       GOOGLE_CLIENT_SECRET
Auth.js       AUTH_GOOGLE_ID         AUTH_GOOGLE_SECRET
```

The page should describe these as examples, not as values to copy into public
content. Never display a complete credential in a screenshot.

### Diagnostics

Useful commands include:

```bash
keyset providers
keyset doctor
keyset verify google
keyset verify google --runtime
keyset verify google --json
keyset setup google --dry-run
```

The JSON mode is intended for scripts and agents. It remains redacted and does
not become a generic shell execution channel.

## 7. CLI and MCP story

### CLI

The CLI is the direct developer interface. The executable name is always
`keyset`, regardless of the npm package scope.

Installation:

```bash
npm install --global @key-set/cli
keyset --version
```

The landing page should make the distinction clear:

```text
Package name: @key-set/cli
Command name: keyset
```

### MCP

Keyset MCP is a local stdio server for compatible coding agents. It is not a
hosted public endpoint and does not need a domain.

Registration example:

```json
{
  "mcpServers": {
    "keyset": {
      "command": "keyset",
      "args": ["mcp"]
    }
  }
}
```

The MCP workflow is bounded and typed:

```text
inspect_project
→ list_providers
→ plan_provider_setup
→ import_credentials
→ setup_provider
→ verify_provider
```

Only the setup operation mutates the application. MCP responses return plans,
statuses, and next actions. They do not return raw secrets and do not expose a
general purpose shell tool.

### Agent value proposition

Suggested copy:

```text
Give your coding agent an OAuth workflow with boundaries.
Keyset lets an agent inspect the project, prepare a typed plan, request the
right human approval, and verify the result without receiving raw credentials.
```

## 8. Package architecture

Use this section for an expandable architecture diagram or package cards.

### `@key-set/core`

Framework independent domain layer. It owns project inspection, setup plans,
transactions, secret safe environment writes, diagnostics, and verification.
It does not depend on CLI, MCP, browser automation, or LLMs.

### `@key-set/cli`

The user facing `keyset` command. It parses commands, presents plans, invokes
Core operations, installs MCP configuration, and reports safe diagnostics.

### `@key-set/mcp`

Local MCP protocol server. It exposes typed project aware tools to compatible
agents and delegates all domain behavior to Core.

### `@key-set/google-automation`

Provider specific Google Cloud Console automation. It uses a visible,
user authorized Chrome session for the operations that currently require the
Console interface. It must not be described as a universal browser agent.

### `@key-set/provider-google`

Google and GitHub provider behavior, including provider metadata, setup plans,
credential validation, redirect planning, and safe credential importing.

### `@key-set/adapter-better-auth`

Detects and safely mutates Better Auth application configuration while
preserving existing providers.

### `@key-set/adapter-authjs`

Detects and safely mutates Auth.js or NextAuth.js application configuration
while preserving existing providers.

### `@key-set/sdk`

Typed public contracts for provider plugins and integration extensions.

Architecture statement for the page:

```text
Provider packages know provider behavior.
Auth adapters know application source shape.
Core coordinates plans and safety.
CLI and MCP expose the same capabilities.
```

## 9. Security and trust section

Suggested section headline:

```text
Automation with a smaller blast radius
```

Use five trust points:

1. Secrets are redacted from CLI output, MCP responses, diagnostics, and
   release artifacts.
2. Environment files are checked against `.gitignore` before credentials are
   written.
3. Mutations are constrained to the inspected project root.
4. Setup is idempotent and local changes can be rolled back when verification
   fails.
5. Google login, MFA, project selection, consent, and provider review remain
   under the user’s control.

Trust copy:

```text
Keyset automates configuration, not consent.
Provider security steps stay visible to the person who owns the account.
```

Do not claim zero risk, fully autonomous Google approval, or universal support.
The page must distinguish a Client ID from a Client Secret and must never use a
real secret as a demo value.

## 10. Supported surface

Present this as a compact compatibility table.

| Area | Current support |
| --- | --- |
| Framework | Next.js project shapes compatible with the tested matrix |
| Auth libraries | Better Auth, Auth.js, and NextAuth.js compatible shapes |
| Providers | Google OAuth and GitHub OAuth |
| Interfaces | CLI, local MCP, Provider SDK, agent instructions |
| Package managers | npm, pnpm, yarn, and Bun detection |
| Runtime | Node.js 20 or newer |
| Google creation path | User authorized Chrome Console automation |
| Verification | Static, semantic, and optional local runtime checks |

Add a link to the compatibility documentation beside the table.

## 11. Future direction

This section should be visibly labeled as planned, not current functionality.

Keyset is intentionally OAuth focused today. A wider developer automation
family may later be developed as separate products:

- Secretset for API keys, environment targets, and secret managers.
- Accessset for users, sessions, roles, and permissions.
- Dataset for databases, migrations, backups, and schema drift.
- Launchset for deployment, domains, DNS, SSL, and hosting.
- Mailset for transactional email and sender configuration.
- Payset for payments, subscriptions, and billing webhooks.
- Appset for application feature and code scaffolding.

Positioning copy:

```text
Keyset starts with the OAuth layer.
The future product family can handle adjacent setup work while keeping each
responsibility explicit, reviewable, and safe.
```

Do not present these names as released products, supported packages, or
features available in the current CLI.

## 12. Social proof and proof strategy

There are no approved customer logos, testimonials, or usage metrics in the
current product brief. Do not invent them.

Use verifiable proof instead:

- Open source repository.
- Public package architecture.
- Supported command examples.
- Test and verification workflow.
- Secret redaction behavior.
- Compatibility and limitation documentation.

If testimonials are added later, obtain permission and use the person’s real
name, role, and organization. Never use placeholder companies or invented
adoption numbers.

## 13. FAQ copy

### What does Keyset do?

Keyset configures and verifies OAuth integrations in existing web applications.
It inspects the project, calculates callback values, imports or creates
provider credentials, updates the supported auth adapter, and checks the
resulting flow.

### Does Keyset replace Better Auth or Auth.js?

No. Keyset configures the OAuth provider integration in the auth library the
application already uses. The application keeps ownership of users, sessions,
roles, and authorization behavior.

### Which providers are supported?

Google Web OAuth and GitHub OAuth are the current provider integrations. The
provider SDK is designed so additional OAuth providers can be added without
coupling provider behavior to the CLI or MCP layer.

### Does Google setup run fully unattended?

Not always. The current Google Console flow keeps login, MFA, project choice,
consent, and provider approval under user control. Keyset can automate the
repeatable configuration around those steps, but it does not bypass Google
security or review requirements.

### Does MCP require a public domain?

No. Keyset MCP runs locally over stdio. An MCP client starts `keyset mcp` on the
developer’s computer, so no hosted MCP domain is required.

### Where are secrets stored?

For local setup, credentials are written to the appropriate ignored environment
file such as `.env.local`. Raw values are not printed in the terminal, returned
through MCP, or committed to the repository.

### Can I preview changes first?

Yes. Use `keyset setup google --dry-run` to inspect the planned origins,
callback, environment keys, and source changes before applying them.

### What happens if setup fails halfway through?

Keyset verifies the result and rolls back supported local changes when a
post-setup mutation or verification step fails. Provider side effects are
reported separately and are never described as automatically reversible when
they are not.

### Does Keyset deploy my application?

No. Deployment, DNS, domain management, databases, email, payments, and
general infrastructure are outside the current Keyset product boundary.

### Can an agent use Keyset?

Yes. The local MCP server exposes typed project inspection, provider planning,
setup, diagnostics, and verification tools. Agents receive redacted results
and bounded next actions rather than unrestricted shell access.

### What happens when the provider console changes?

Keyset stops when it cannot safely identify the required page or field. It
reports a diagnostic and avoids applying newly read credentials blindly. The
Google Console automation is intentionally provider specific and may require
maintenance when Google changes the interface.

## 14. Final CTA

### Headline

```text
Make the next OAuth setup repeatable
```

### Body

```text
Start with a project inspection, preview the plan, and verify the redirect
before your users encounter a configuration error.
```

### Button

```text
Install Keyset
```

### Supporting command

```bash
npm install --global @key-set/cli
keyset inspect
```

## 15. SEO and AEO

### Indexing recommendation

Index the page. It is an evergreen open source product page with clear search
intent around OAuth setup automation, Google OAuth configuration, and Next.js
authentication.

### Title

```text
Keyset | OAuth setup automation for web applications
```

### Meta description

```text
Keyset configures, verifies, and maintains Google and GitHub OAuth in existing
Next.js applications using Better Auth or Auth.js, with safe credentials and
CLI or MCP workflows.
```

### Suggested keywords

- OAuth setup automation.
- Google OAuth setup Next.js.
- Better Auth Google provider.
- Auth.js OAuth configuration.
- GitHub OAuth App setup.
- MCP OAuth automation.
- OAuth redirect URI verification.

### Suggested structured data

- `SoftwareApplication`.
- `FAQPage` for the visible FAQ content.
- `BreadcrumbList` if the site has documentation subpages.

Do not add fake ratings, fake review counts, or unsupported software pricing.

## 16. Visual implementation direction

### Overall direction

Use a restrained developer tool aesthetic: dark, precise, calm, and technical.
The page should feel like a trustworthy control surface rather than a generic
AI landing page.

### Typography

- Use one approved typeface, preferably Geist.
- Use Geist Mono only for commands, code, and structured output.
- Use sentence case headings.
- Do not use italic text or ultra bold weights.
- Use balanced headline wrapping and readable body measure.

### Color and surfaces

- Use flat backgrounds only.
- Dark base may use `#000000`, `#181818`, `#1F1F1F`, `#272727`, `#313131`, or
  `#131209`.
- Use a quiet light surface for code output and a high contrast text hierarchy.
- Do not use background gradients.
- A subtle left to right gradient is allowed only on the hero heading text.

### Spacing and shape

- Use the shared spacing scale: 0, 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80,
  and 96 pixels.
- Use standard Tailwind radius values only.
- Cards have complete borders or no borders. Never use a single sided card
  border.
- Keep the page width controlled and preserve generous space around code
  visuals.

### Navigation

Use a compact floating navigation with these links:

```text
Product   How it works   Packages   Security   Docs
```

Primary nav button:

```text
Install Keyset
```

On mobile, use a fluid full screen menu with a visible focus state and a clear
close action.

### Icons and motion

- Use Phosphor, Solar, or Iconamoon icons.
- Do not use Material Icons or Material Symbols.
- Use the custom easing curve `cubic-bezier(0.32,0.72,0,1)` for transitions.
- Use IntersectionObserver for scroll reveals.
- Reveal the tagline word by word.
- Respect `prefers-reduced-motion` and provide an immediate static state.

## 17. Accessibility and completion checklist

- Semantic `nav`, `main`, `section`, `article`, and footer elements.
- Skip to content link.
- Keyboard accessible navigation and CTA buttons.
- Visible focus rings.
- Meaningful alt text for terminal and architecture visuals.
- No information communicated by color alone.
- Code blocks readable on small screens with horizontal overflow handled.
- Reduced motion support.
- Branded favicon and social image.
- Open Graph and Twitter metadata.
- Privacy and terms links in the footer.
- Branded 404 page.
- No dead links or placeholder buttons.

## 18. Content restrictions

Do not use:

- Claims of completely unattended Google approval.
- Claims that Keyset stores or sees user passwords.
- Real OAuth secrets, tokens, emails, or personal paths.
- Invented customer logos, testimonials, metrics, or awards.
- Vague claims such as “seamless”, “next generation”, or “game changer”.
- A feature list that suggests database, deployment, payment, or email support
  already ships in Keyset.

## 19. Implementation handoff

The web implementation should create the following sections in order:

1. Navigation.
2. Hero with terminal visual and one primary CTA.
3. Benefits.
4. Tagline reveal.
5. How it works.
6. Product capabilities.
7. CLI and MCP workflow.
8. Package architecture.
9. Security and trust.
10. Supported surface.
11. Planned product family.
12. FAQ.
13. Final CTA.
14. Footer with documentation, GitHub, legal, and package links.

The implementation is successful when a first time visitor can answer three
questions within one scroll:

1. What is Keyset?
2. Does it work with my OAuth stack?
3. What command do I run next?
