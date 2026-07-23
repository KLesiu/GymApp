import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { openApiSpec } from "../../express-api/src/core/openapi/spec";

const target = resolve("src/api/generated/openapi.json");
const mobileOpenApiSpec = {
  ...openApiSpec,
  info: {
    ...openApiSpec.info,
    title: "LiftContext Express API",
    description: "Express API contract consumed by LiftContext mobile.",
  },
};

mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, JSON.stringify(mobileOpenApiSpec, null, 2));
console.log(`Wrote ${target}`);
