import { REPO_URL } from "./site";

// Commands shown on the site. They must match the real CLI (packages/cli/src/index.ts) and README.

export const INSTALL_FROM_NPM = "npm install -g @key-set/cli";

export const INSTALL_FROM_SOURCE = [
  `git clone ${REPO_URL}.git`,
  "cd keyset",
  "npm install",
  "npm run build",
  "npm link --workspace=@key-set/cli",
  "keyset --version",
].join("\n");

export const FIRST_RUN = [
  INSTALL_FROM_NPM,
  "# then, inside your Next.js app",
  "keyset inspect",
].join("\n");

export const MCP_INSTALL = ["keyset mcp install claude", "keyset mcp install codex"].join("\n");

/** Matches what `keyset mcp install` writes (packages/cli/src/distribution.ts). */
export const MCP_CONFIG = JSON.stringify({ mcpServers: { keyset: { command: "keyset-mcp", args: [] } } }, null, 2);

export const MCP_TOOLS: { name: string; mutating?: boolean }[] = [
  { name: "inspect_project" },
  { name: "list_providers" },
  { name: "plan_provider_setup" },
  { name: "import_credentials" },
  { name: "setup_provider", mutating: true },
  { name: "verify_provider" },
];

export const DIAGNOSTIC_COMMANDS = [
  "keyset providers",
  "keyset doctor",
  "keyset verify google",
  "keyset verify google --runtime",
  "keyset verify google --json",
  "keyset setup google --dry-run",
].join("\n");

export const ENV_ROWS = [
  { adapter: "Better Auth", id: "GOOGLE_CLIENT_ID", secret: "GOOGLE_CLIENT_SECRET" },
  { adapter: "Auth.js", id: "AUTH_GOOGLE_ID", secret: "AUTH_GOOGLE_SECRET" },
];
