import test from "node:test";
import assert from "node:assert/strict";
import { inspectAuthorizationRedirect, inspectRedirectChain, redactUrl, resolveProjectCommand } from "../dist/index.js";

const expected = "http://localhost:43000/api/auth/callback/google";
const valid = "https://accounts.google.com/o/oauth2/v2/auth?client_id=client&redirect_uri=http%3A%2F%2Flocalhost%3A43000%2Fapi%2Fauth%2Fcallback%2Fgoogle&response_type=code&scope=openid%20email&state=secret-state";

test("inspects valid and malformed Google redirects without exposing secrets", () => {
  const result = inspectAuthorizationRedirect(valid, expected, "client");
  assert.equal(result.ok, true); assert.match(result.redactedUrl, /state=%5BREDACTED%5D/); assert.equal(result.redactedUrl.includes("secret-state"), false);
  assert.equal(inspectAuthorizationRedirect(valid.replace("http%3A%2F%2Flocalhost%3A43000%2Fapi%2Fauth%2Fcallback%2Fgoogle", "http%3A%2F%2Fevil.test%2Fcallback"), expected, "client").ok, false);
  assert.equal(inspectAuthorizationRedirect(valid.replace("response_type=code", "response_type=token"), expected, "client").ok, false);
  assert.equal(redactUrl("https://example.test/?nonce=n&code_verifier=v&access_token=t").includes("nonce=n"), false);
  const safe = inspectAuthorizationRedirect(`${valid}&nonce=secret-nonce&code_verifier=secret-verifier`, expected, "client");
  assert.equal(JSON.stringify(safe).includes("secret-nonce"), false);
  assert.equal(JSON.stringify(safe).includes("secret-verifier"), false);
  assert.equal(inspectAuthorizationRedirect(valid.replace("client_id=client", "response_type=code"), expected).clientId, false);
});

test("resolves package-manager commands without replacing the selected manager", () => {
  assert.equal(resolveProjectCommand({ packageManager: "npm" }, "dev", ["--port", "1"]).packageManager, "npm");
  assert.match(resolveProjectCommand({ packageManager: "pnpm" }, "dev")?.executable, /^pnpm(?:\.cmd)?$/);
  assert.match(resolveProjectCommand({ packageManager: "bun" }, "dev")?.executable, /^bun(?:\.cmd)?$/);
  assert.equal(resolveProjectCommand({ packageManager: "unknown" }), undefined);
});

test("stops redirect loops and follows only bounded local redirects", async () => {
  const server = await import("node:http").then(({ createServer }) => new Promise(resolve => {
    const instance = createServer((req, res) => { res.writeHead(302, { location: req.url === "/a" ? "/b" : "/a" }); res.end(); }); instance.listen(0, "127.0.0.1", () => resolve(instance));
  }));
  const address = server.address(); const result = await inspectRedirectChain(`http://127.0.0.1:${address.port}/a`, expected, undefined, { maxRedirects: 3 });
  assert.equal(result.loop, true); server.close();
});
