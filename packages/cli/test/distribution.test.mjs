import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installMcp, installSkill } from "../dist/distribution.js";

test("Codex MCP installation is dry-run safe, preserves config, and is idempotent", () => {
  const root = mkdtempSync(join(tmpdir(), "keyset-cli-"));
  const path = join(root, "config.toml");
  writeFileSync(path, "model = \"gpt-5\"\n\n[other]\nvalue = true\n");
  const before = readFileSync(path, "utf8");
  assert.equal(installMcp("codex", { configPath: path, dryRun: true }).changed, true);
  assert.equal(readFileSync(path, "utf8"), before);
  const installed = installMcp("codex", { configPath: path });
  assert.equal(installed.changed, true);
  assert.match(readFileSync(path, "utf8"), /\[other\]/);
  assert.equal(installMcp("codex", { configPath: path }).changed, false);
  assert.ok(installed.backup);
});

test("Claude MCP installation preserves unrelated servers and rejects conflicts", () => {
  const root = mkdtempSync(join(tmpdir(), "keyset-cli-"));
  const path = join(root, "claude.json");
  writeFileSync(path, JSON.stringify({ mcpServers: { existing: { command: "other" } } }));
  assert.equal(installMcp("claude", { configPath: path }).changed, true);
  const config = JSON.parse(readFileSync(path, "utf8"));
  assert.equal(config.mcpServers.existing.command, "other");
  assert.equal(installMcp("claude", { configPath: path }).changed, false);
  writeFileSync(path, JSON.stringify({ mcpServers: { keyset: { command: "unsafe" } } }));
  assert.throws(() => installMcp("claude", { configPath: path }), /different/);
});

test("skill installation does not overwrite an existing skill", () => {
  const root = mkdtempSync(join(tmpdir(), "keyset-cli-"));
  const path = join(root, "SKILL.md");
  assert.equal(installSkill("codex", { configPath: path, dryRun: true }).changed, true);
  assert.equal(installSkill("codex", { configPath: path }).changed, true);
  assert.equal(installSkill("codex", { configPath: path }).changed, false);
  writeFileSync(path, "user content\n");
  assert.throws(() => installSkill("codex", { configPath: path }), /Refusing/);
});
