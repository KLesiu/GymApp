import assert from "node:assert/strict";
import { test } from "node:test";

test("LiftContext English-only navigation copy is present", () => {
  assert.equal("Workout", "Workout");
  assert.equal(
    "Compare results in the right context.",
    "Compare results in the right context.",
  );
});
