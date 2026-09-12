# Onset site

The website at <https://onset.fatihunal.dev>. Onset is the umbrella name for a
family of developer automation products. Keyset is the first and currently the
only released one, so the home page is the Keyset product page.

The site is a standalone Next.js app with a static export. It is not part of the
root npm workspaces, so the repository's `npm run verify` does not build it.

## Commands

Run from `site/` with Node.js 20.9 or newer:

```bash
npm install
npm run dev          # local development server
npm run build        # static export to out/
npm run typecheck    # run after a build (it generates next-env.d.ts)
npm run lint
npm run check:links  # checks every internal link and anchor in out/
```

The build reads `../docs/*.md`, so it must run from a full repository checkout.
When deploying, use `site` as the root directory with the whole repository
available, and publish `out/`.

## Where things live

| Path | Contents |
| --- | --- |
| `content/i18n/en.ts`, `tr.ts` | Every visible string. `tr.ts` is type checked against the same `Dictionary`, so a missing translation fails the build. Backticks in strings render as inline code. |
| `content/products.ts` | The Onset product registry and each product's status. |
| `lib/commands.ts` | Commands shown on the site. Keep them in step with the real CLI. |
| `lib/docs.ts` | The allowlist of published docs and the markdown pipeline. |
| `components/landing/` | Keyset landing sections, in page order in `KeysetLanding.tsx`. |
| `app/globals.css` | Design tokens and the motion rules. |

Only the docs listed in `DOC_GROUPS` in `lib/docs.ts` are published under
`/docs/keyset/<slug>/`. Internal documents (PRD, landing brief, release notes)
stay unpublished. Docs are English only.

## Content rules

The source brief is `docs/LANDING-PAGE-BRIEF.md`. The main constraints:

- Do not invent logos, testimonials, or usage numbers.
- Never show a real client ID, secret, email address, or personal path.
- Products that are in development have no link and no command, and are always
  labeled as in development.
- Keep the published `npm install -g @key-set/cli` command as the primary install
  path. Keep source linking only under the contributor guidance.

## When the next Onset product ships

1. In `content/products.ts`, set the product's status to `available` and add its `href`.
2. Move the Keyset landing (`app/page.tsx`, `app/tr/page.tsx`) to `/keyset`.
3. Build an Onset overview for `/` and `/tr`.
4. Publish the product's docs under `/docs/<product>/`.

Docs already live under `/docs/keyset/`, so their URLs do not change.
