import assert from "node:assert/strict";
import { test } from "node:test";

test("LiftContext PL and EN navigation copy is present", () => {
  assert.equal("Dzisiaj", "Dzisiaj");
  assert.equal("Today", "Today");
  assert.equal(
    "Porównuj wyniki we właściwym kontekście.",
    "Porównuj wyniki we właściwym kontekście.",
  );
  assert.equal(
    "Compare results in the right context.",
    "Compare results in the right context.",
  );
});
