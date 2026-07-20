// scripts/scaffoldFrStubs.mjs
// A stub value begins with STUB_PREFIX so both humans and the coverage check can
// tell "not yet translated" from a real French string. collectFrGap/resolveFrField
// treat a stub as UNFILLED (see the guard in utils/fr/resolveFrField.ts) so the
// build stays red until every scaffolded stub is translated.
export const STUB_PREFIX = "__STUB__ ";

export const mergeStubs = (overrides, gaps) => {
  const merged = structuredClone(overrides);
  let addedCount = 0;
  for (const { entityType, id, field, englishRef } of gaps) {
    merged[entityType] ??= {};
    merged[entityType][id] ??= {};
    if (merged[entityType][id][field] === undefined) {
      merged[entityType][id][field] = `${STUB_PREFIX}${englishRef}`;
      addedCount++;
    }
  }
  return { merged, addedCount };
};
