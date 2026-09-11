import type { Action, Capability, SecretValue, SetupPlan, VerificationResult, ProjectInspection, VerificationCheck } from "@keyset/core";

export type ProviderId = string;

/** Provider capabilities are explicit so consumers do not assume Google-only behavior. */
export interface ProviderCapabilities {
  guidedProvisioning: boolean;
  credentialImport: boolean;
  redirectUris: boolean;
  authorizedOrigins: boolean;
  runtimeAuthorizationInspection: boolean;
}
export interface ProviderIdentity { id: ProviderId; name: string; protocol: "oauth2"; }
export interface ProviderMetadata extends ProviderIdentity { capabilities: ProviderCapabilities; supported: boolean; }
export interface Prerequisite { id: string; title: string; satisfied: boolean; detail: string; }
export interface CredentialInput { clientId: SecretValue; clientSecret: SecretValue; }
export interface EnvironmentRequirement { id: string; description: string; secret: boolean; }
export interface RedirectPlan { homepageUrl: string; authorizationCallbackUrl: string; authorizedOrigins: string[]; redirectUris: string[]; }
export interface RuntimeVerificationContext { project: ProjectInspection; checks: VerificationCheck[]; }
export interface RemediationDiagnostic { code: string; message: string; remediation: string; severity: "info" | "warning" | "error"; }
export interface ProviderPlugin {
  metadata: ProviderMetadata;
  prerequisites(projectRoot: string): Promise<Prerequisite[]> | Prerequisite[];
  plan(projectRoot: string): Promise<SetupPlan> | SetupPlan;
  importCredentials(input: unknown): CredentialInput;
  validate(projectRoot: string): Promise<VerificationResult> | VerificationResult;
  environment?: EnvironmentRequirement[];
  redirectPlan?(project: ProjectInspection): RedirectPlan;
  verifyStatic?(project: ProjectInspection): VerificationResult;
  verifySemantic?(project: ProjectInspection): VerificationResult;
  inspectRuntime?(project: ProjectInspection, checks: VerificationCheck[]): Promise<VerificationCheck[]>;
  diagnostics?(project: ProjectInspection): RemediationDiagnostic[];
  actions?: Action[];
}
export type { Action, Capability, SecretValue, SetupPlan, VerificationResult, ProjectInspection, VerificationCheck };
