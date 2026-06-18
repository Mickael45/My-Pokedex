import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { typeSlugs } from "./generateSitemap.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const typesSrc = readFileSync(join(here, "..", "constants", "Types.ts"), "utf8");

// The 18 string-literal type values exported by constants/Types.ts.
const sourceTypes = [...typesSrc.matchAll(/=\s*"([a-z]+)"/g)].map((match) => match[1]);

test("constants/Types.ts exports 18 types", () => {
  assert.equal(sourceTypes.length, 18);
});

// generateSitemap.mjs hardcodes a mirror of the 18 types (it can't import the
// .ts). This guards against the two lists silently drifting apart.
test("sitemap generator's hardcoded types match constants/Types.ts", () => {
  const singles = typeSlugs().filter((slug) => !slug.includes("-"));
  assert.deepEqual([...singles].sort(), [...sourceTypes].sort());
});
