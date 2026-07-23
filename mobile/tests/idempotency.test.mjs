import assert from "node:assert/strict";
import { test } from "node:test";

const createIdempotencyKey = (scope, id) => `${scope}:${id}`;

test("creates stable idempotency key per finalize operation", () => {
  assert.equal(
    createIdempotencyKey("workout-finalize", "draft-1"),
    createIdempotencyKey("workout-finalize", "draft-1"),
  );
  assert.notEqual(
    createIdempotencyKey("workout-finalize", "draft-1"),
    createIdempotencyKey("workout-finalize", "draft-2"),
  );
});
