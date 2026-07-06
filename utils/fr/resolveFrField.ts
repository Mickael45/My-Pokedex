export class FrCoverageError extends Error {
  constructor(entityType: string, id: string, field: string) {
    super(
      `Missing French value for ${entityType}.${id}.${field}. ` +
        `Add it to locales/fr-overrides.json or run "npm run check-fr-coverage" to scaffold it.`
    );
    this.name = "FrCoverageError";
  }
}

export type FrOverrides = Record<string, Record<string, Record<string, string>>>;

type Args = {
  entityType: string;
  id: string;
  field: string;
  apiValue: string | null;
  overrides: FrOverrides;
};

// A scaffolded-but-untranslated stub (value starting with "__STUB__ ") counts as
// MISSING so the build stays honest until Mickael fills in a real French string.
const overrideValue = ({ entityType, id, field, overrides }: Args): string | null => {
  const value = overrides?.[entityType]?.[id]?.[field];
  if (!value || !value.trim() || value.startsWith("__STUB__ ")) return null;
  return value;
};

const apiOrNull = (apiValue: string | null): string | null => (apiValue && apiValue.trim() ? apiValue : null);

export const resolveFrField = (args: Args): string => {
  const resolved = apiOrNull(args.apiValue) ?? overrideValue(args);
  if (resolved === null) {
    throw new FrCoverageError(args.entityType, args.id, args.field);
  }
  return resolved;
};

export const collectFrGap = (args: Args): { entityType: string; id: string; field: string } | null => {
  const resolved = apiOrNull(args.apiValue) ?? overrideValue(args);
  return resolved === null ? { entityType: args.entityType, id: args.id, field: args.field } : null;
};
