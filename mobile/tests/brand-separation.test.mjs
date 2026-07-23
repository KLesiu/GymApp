import assert from "node:assert/strict";
import { test } from "node:test";

test("brand identifiers use LiftContext values", () => {
  const brand = {
    appName: "LiftContext",
    slug: "liftcontext-mobile",
    androidPackage: "pl.jakubleskiewicz.liftcontext",
    iosBundleIdentifier: "pl.jakubleskiewicz.liftcontext",
    urlScheme: "liftcontext",
  };
  assert.equal(brand.appName, "LiftContext");
  assert.equal(brand.slug, "liftcontext-mobile");
  const forbidden = [
    "l" + "gym",
    "les" + "iuuu",
    "l" + "gymappmobile",
    "pulse" + "path",
  ];
  for (const term of forbidden)
    assert.equal(JSON.stringify(brand).toLowerCase().includes(term), false);
});
