import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mutateAuthJs } from "../dist/index.js";

test("adds Google import and provider while preserving existing Auth.js providers", () => {
  const root = mkdtempSync(join(tmpdir(), "keyset-authjs-")); const path = join(root, "auth.ts");
  writeFileSync(path, 'import GitHub from "next-auth/providers/github";\nexport const authOptions = { providers: [GitHub({})] };\n');
  const result = mutateAuthJs({ root, authAdapter: "authjs" });
  assert.equal(result[0].changed, true); assert.match(result[0].content, /next-auth\/providers\/google/); assert.match(result[0].content, /Google\(\{/); assert.match(result[0].content, /GitHub/);
});

test("adds GitHub to Auth.js without duplicating an existing Google provider", () => {
  const root = mkdtempSync(join(tmpdir(), "keyset-authjs-github-")); const path = join(root, "auth.ts");
  writeFileSync(path, 'import Google from "next-auth/providers/google";\nexport const authOptions = { providers: [Google({})] };\n');
  const result = mutateAuthJs({ root, authAdapter: "authjs" }, "github");
  assert.equal(result[0].changed, true); assert.match(result[0].content, /next-auth\/providers\/github/); assert.match(result[0].content, /GitHub\(\{ clientId: process\.env\.AUTH_GITHUB_ID/); assert.match(result[0].content, /Google/);
});
