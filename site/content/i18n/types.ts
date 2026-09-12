/**
 * Every visible string on the landing, legal and 404 pages. `tr.ts` uses `satisfies Dictionary`,
 * so a missing translation fails the type check. Inline `code` in strings is rendered as <code>.
 */
export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalPage {
  title: string;
  description: string;
  updated: string;
  sections: LegalSection[];
}

export interface Dictionary {
  meta: { title: string; description: string; ogAlt: string };
  skipLink: string;
  nav: {
    label: string;
    home: string;
    product: string;
    howItWorks: string;
    packages: string;
    security: string;
    docs: string;
    docsNote: string;
    install: string;
    openMenu: string;
    closeMenu: string;
    language: string;
    current: string;
  };
  hero: {
    eyebrow: string;
    headline: [string, string];
    sub: string;
    cta: string;
    secondary: string;
    helper: string;
    proof: string;
    terminalLabel: string;
    statusTitle: string;
    statusMeta: string;
    statusLabel: string;
  };
  benefits: {
    eyebrow: string;
    title: string;
    items: { label: string; title: string; body: string }[];
  };
  tagline: { lines: string[] };
  how: {
    eyebrow: string;
    title: string;
    intro: string;
    stepLabel: string;
    steps: { name: string; badge: string; command: string; title: string; body: string; note?: string }[];
    flowLabel: string;
  };
  capabilities: {
    eyebrow: string;
    title: string;
    intro: string;
    inspection: { title: string; items: string[] };
    providers: { title: string; body: string; items: string[] };
    auth: { title: string; body: string; items: string[] };
    env: { title: string; adapter: string; clientId: string; clientSecret: string; note: string };
    diagnostics: { title: string; body: string };
  };
  cliMcp: {
    eyebrow: string;
    title: string;
    intro: string;
    cli: { title: string; body: string; packageLabel: string; commandLabel: string; installTitle: string; installNote: string; sourceTitle: string; sourceNote: string };
    mcp: { title: string; body: string; installTitle: string; configTitle: string; flowTitle: string; mutatingLabel: string; note: string };
    agent: { title: string; body: string };
  };
  packages: {
    eyebrow: string;
    title: string;
    intro: string;
    items: { name: string; body: string }[];
    statement: string[];
  };
  security: {
    eyebrow: string;
    title: string;
    intro: string;
    points: { title: string; body: string }[];
    trust: [string, string];
    policyLink: string;
    threatModelLink: string;
  };
  support: {
    eyebrow: string;
    title: string;
    intro: string;
    headArea: string;
    headValue: string;
    rows: [string, string][];
    link: string;
  };
  family: {
    eyebrow: string;
    title: string;
    body: string;
    available: string;
    inDevelopment: string;
    note: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    items: { q: string; a: string }[];
  };
  final: { title: string; body: string; cta: string; secondary: string; commandsLabel: string };
  footer: {
    tagline: string;
    productsTitle: string;
    resourcesTitle: string;
    legalTitle: string;
    packagesTitle: string;
    docs: string;
    github: string;
    security: string;
    privacy: string;
    terms: string;
    license: string;
    inDevelopment: string;
    rights: string;
  };
  common: { copy: string; copied: string; copyLabel: string; english: string };
  privacy: LegalPage;
  terms: LegalPage;
}
