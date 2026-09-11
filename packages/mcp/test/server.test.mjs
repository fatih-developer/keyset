import test from "node:test";
import assert from "node:assert/strict";
import { Readable, Writable } from "node:stream";
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { handleTool, startMcpServer, serverInfo } from "../dist/index.js";

test("MCP server reports version metadata and handles tools/list", async () => {
  const output = [];
  const writable = new Writable({ write(chunk, _encoding, callback) { output.push(JSON.parse(String(chunk))); callback(); } });
  await startMcpServer(Readable.from([JSON.stringify({ jsonrpc: "2.0", id: 1, method: "server/info" }) + "\n", JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }) + "\n"]), writable);
  assert.equal(serverInfo().name, "keyset");
  assert.equal(output[0].result.name, "keyset");
  assert.ok(output[1].result.tools.some(tool => tool.name === "inspect_project"));
});

test("MCP Google setup selects Google for Auth.js projects", async () => {
  const root = mkdtempSync(join(tmpdir(), "keyset-mcp-authjs-"));
  mkdirSync(join(root, "app", "api", "auth", "[...nextauth]"), { recursive: true });
  writeFileSync(join(root, "package.json"), JSON.stringify({ dependencies: { next: "x", "next-auth": "x" } }));
  writeFileSync(join(root, "auth.ts"), "export const authOptions = { providers: [] };\n");
  writeFileSync(join(root, "app", "api", "auth", "[...nextauth]", "route.ts"), "export const handlers = {};\n");
  const result = await handleTool("setup_provider", { project: root, provider: "google", clientId: "client-id", clientSecret: "client-secret" });
  assert.equal(result.status, "ready_to_apply");
  assert.match(readFileSync(join(root, "auth.ts"), "utf8"), /next-auth\/providers\/google/);
});
