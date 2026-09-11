import test from "node:test";
import assert from "node:assert/strict";
import { importGoogleCredentials, validateGoogleAuthorizationRequest } from "../dist/index.js";
import { importGithubCredentials, planGithubSetup, validateGithubAuthorizationRequest } from "../dist/index.js";
import { inspectProject } from "@keyset/core";

test("validates Web credentials without returning secrets", () => {
  const result = importGoogleCredentials({ web: { client_id: "1234567890-test.apps.googleusercontent.com", client_secret: "placeholder-secret" } });
  assert.equal(result.clientId.toJSON(), "[REDACTED]"); assert.equal(result.clientSecret.toString(), "[REDACTED]");
  assert.throws(() => importGoogleCredentials({ installed: { client_id: "x", client_secret: "y" } }), /Web application/);
});

test("validates Google authorization request shape", () => {
  const url = "https://accounts.google.com/o/oauth2/v2/auth?client_id=client&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fgoogle&response_type=code&scope=openid%20email";
  assert.equal(validateGoogleAuthorizationRequest(url, "http://localhost:3000/api/auth/callback/google", "client").ok, true);
  assert.equal(validateGoogleAuthorizationRequest(url, "https://example.com/api/auth/callback/google", "client").ok, false);
});

test("imports GitHub credentials safely and rejects incomplete input", () => {
  const result = importGithubCredentials('{"client_id":"Iv1.test","client_secret":"github-secret"}');
  assert.equal(result.clientId.toString(), "[REDACTED]");
  assert.equal(result.clientSecret.toJSON(), "[REDACTED]");
  assert.throws(() => importGithubCredentials({ client_id: "Iv1.test" }), /non-empty/);
});

test("creates a deterministic GitHub setup plan", () => {
  const project = inspectProject(process.cwd());
  const first = planGithubSetup(project);
  const second = planGithubSetup(project);
  assert.deepEqual(first, second);
  assert.equal(first.provider, "github");
  assert.match(first.callbacks[0].redirectUri, /\/api\/auth\/callback\/github$/);
  assert.equal(first.actions[0].kind, "manual");
  assert.doesNotMatch(JSON.stringify(first), /github-secret/i);
});

test("validates GitHub authorization request shape", () => {
  const redirect = "http://localhost:3000/api/auth/callback/github";
  const url = `https://github.com/login/oauth/authorize?client_id=Iv1.test&redirect_uri=${encodeURIComponent(redirect)}&state=secret-state`;
  assert.equal(validateGithubAuthorizationRequest(url, redirect, "Iv1.test").ok, true);
  assert.equal(validateGithubAuthorizationRequest(url, "https://example.com/callback").ok, false);
});
