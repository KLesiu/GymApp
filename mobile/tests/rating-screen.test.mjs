import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync("app/(app)/(tabs)/profile.tsx", "utf8");

test("profile screen presents LiftContext Rating data", () => {
  assert.match(source, /useRanking/);
  assert.match(source, /useEloChart/);
  assert.match(source, /LiftContext Rating/);
  assert.match(source, /Rating history/);
  assert.match(source, /Top ranking/);
});
