/**
 * Resolves a Pokemon type name to its locally-hosted type icon
 * (full-color circular badges under /public/images/types).
 */
export const getTypeIconUrl = (type: string) => `/images/types/${type.toLowerCase()}.svg`;
