import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_SENTINELS, findSentinels, runCommand, scanRepository } from "./secret-sentinel.mjs";

test("detects every injected sentinel in captured output", () => {
  const sentinels = DEFAULT_SENTINELS.slice(1, 3);
  assert.deepEqual(findSentinels(`safe output ${sentinels[0]} and ${sentinels[1]}`, sentinels), sentinels);
  assert.deepEqual(findSentinels("redacted output", sentinels), []);
});

test("repository is free of the standard sentinels", async () => {
  assert.deepEqual(await scanRepository(process.cwd()), []);
});

test("captures child-process output without invoking a shell and detects a leak", async () => {
  const sentinel = DEFAULT_SENTINELS[0];
  const result = await runCommand(process.execPath, ["-e", `process.stdout.write(process.env.KEYSET_SENTINEL_${sentinel})`], { sentinels: [sentinel] });
  assert.deepEqual(result.leaked, [sentinel]);
});
