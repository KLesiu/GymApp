import assert from "node:assert/strict";
import { test } from "node:test";

const selectSameGymBenchmark = (scores, gymId, exerciseId, series) =>
  scores.find(
    (score) =>
      score.gymId === gymId &&
      score.exerciseId === exerciseId &&
      score.series === series,
  );

test("shows benchmark for same gym", () => {
  assert.equal(
    selectSameGymBenchmark(
      [{ gymId: "a", exerciseId: "e", series: 1, weight: 80 }],
      "a",
      "e",
      1,
    ).weight,
    80,
  );
});

test("does not show benchmark from a different gym", () => {
  assert.equal(
    selectSameGymBenchmark(
      [{ gymId: "b", exerciseId: "e", series: 1, weight: 120 }],
      "a",
      "e",
      1,
    ),
    undefined,
  );
});
