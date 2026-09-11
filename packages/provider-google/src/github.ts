import { inspectProject, SecretValue, verify, type ProjectInspection, type SetupPlan } from "@keyset/core";
import type { CredentialInput, ProviderPlugin, RedirectPlan } from "@keyset/sdk";

function credentialsObject(input: unknown): Record<string, unknown> {
  let value: unknown;
  try { value = typeof input === "string" ? JSON.parse(input) : input; }
  catch { throw new Error("GitHub credential JSON is malformed."); }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("GitHub credentials must be a JSON object.");
  return value as Record<string, unknown>;
}

/** Imports GitHub OAuth App credentials without ever returning a plain secret. */
export function importGithubCredentials(input: unknown): CredentialInput {
  const value = credentialsObject(input);
  const clientId = value.client_id ?? value.clientId ?? value.GITHUB_ID ?? value.GITHUB_CLIENT_ID;
  const clientSecret = value.client_secret ?? value.clientSecret ?? value.GITHUB_SECRET ?? value.GITHUB_CLIENT_SECRET;
  if (typeof clientId !== "string" || !clientId.trim() || typeof clientSecret !== "string" || !clientSecret.trim()) {
    throw new Error("GitHub credential input must contain non-empty client_id and client_secret");
  }
  if (clientId.trim() === clientSecret.trim()) throw new Error("GitHub client_id and client_secret must be different values");
  return { clientId: new SecretValue(clientId.trim()), clientSecret: new SecretValue(clientSecret.trim()) };
}

export function githubRedirectPlan(project: ProjectInspection): RedirectPlan {
  const origins = [project.localUrl, ...(project.productionUrl ? [project.productionUrl] : [])].map(url => url.replace(/\/$/, ""));
  return { homepageUrl: origins[0], authorizationCallbackUrl: `${origins[0]}/api/auth/callback/github`, authorizedOrigins: [], redirectUris: origins.map(origin => `${origin}/api/auth/callback/github`) };
}

export function planGithubSetup(project: ProjectInspection): SetupPlan {
  const redirect = githubRedirectPlan(project);
  return { provider: "github", capability: "guided_setup", callbacks: redirect.redirectUris.map(redirectUri => ({ origin: new URL(redirectUri).origin, redirectUri })), envKeys: project.authAdapter === "authjs" ? ["AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET"] : ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"], actions: [{ id: "github-settings", kind: "manual", title: "Create a GitHub OAuth App", description: `Register an OAuth App with application name suggestion \"${suggestedGithubApplicationName(project)}\", homepage URL ${redirect.homepageUrl}, and authorization callback URL ${redirect.authorizationCallbackUrl}.`, targetUrl: "https://github.com/settings/developers" }] };
}

export function suggestedGithubApplicationName(project: ProjectInspection): string {
  const root = project.root.replace(/[\\/]+$/, "").split(/[\\/]/).pop() || "Keyset application";
  return root.replace(/[-_]+/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
}

export function validateGithubAuthorizationRequest(value: string, expectedRedirectUri: string, expectedClientId?: string): { ok: boolean; message: string } {
  try {
    const url = new URL(value);
    const valid = url.hostname === "github.com" && url.pathname === "/login/oauth/authorize" && url.searchParams.get("client_id") !== null && (!expectedClientId || url.searchParams.get("client_id") === expectedClientId) && url.searchParams.get("redirect_uri") === expectedRedirectUri;
    return { ok: valid, message: valid ? "GitHub authorization request is structurally valid." : "GitHub authorization request has an invalid endpoint, client, or redirect URI." };
  } catch { return { ok: false, message: "GitHub authorization request is not a valid URL." }; }
}

export function createGithubProvider(projectRoot: string): ProviderPlugin {
  return {
    metadata: { id: "github", name: "GitHub OAuth", protocol: "oauth2", supported: true, capabilities: { guidedProvisioning: true, credentialImport: true, redirectUris: true, authorizedOrigins: false, runtimeAuthorizationInspection: true } },
    prerequisites: () => [{ id: "github-account", title: "GitHub account", satisfied: false, detail: "OAuth App creation requires the GitHub Developer settings page." }],
    plan: () => planGithubSetup(inspectProject(projectRoot)),
    importCredentials: importGithubCredentials,
    validate: () => verify(inspectProject(projectRoot), "github"),
    verifyStatic: project => verify(project, "github"),
    verifySemantic: project => ({ provider: "github", status: project.authAdapter === "unknown" ? "invalid" : "manual_required", checks: [{ code: "github.oauth_app", ok: true, level: "semantic", status: "warn", message: "GitHub OAuth App registration must be confirmed in GitHub Developer settings." }], exitCode: 3 }),
    inspectRuntime: async (_project, checks) => [...checks, { code: "github.authorization_redirect", ok: true, level: "runtime", status: "skipped", message: "Runtime redirect inspection requires a running application and is not performed by the provider package." }],
    redirectPlan: githubRedirectPlan,
    environment: [{ id: "GITHUB_CLIENT_ID", description: "GitHub OAuth App client ID", secret: false }, { id: "GITHUB_CLIENT_SECRET", description: "GitHub OAuth App client secret", secret: true }],
    actions: [{ id: "github-settings", kind: "manual", title: "Create a GitHub OAuth App", description: "Create the OAuth App in GitHub Developer settings.", targetUrl: "https://github.com/settings/developers" }],
  };
}
