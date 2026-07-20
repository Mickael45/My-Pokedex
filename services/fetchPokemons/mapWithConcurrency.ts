// Runs fn over items with at most `limit` concurrent, preserving input order.
export const mapWithConcurrency = async <T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  limit: number
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  };
  const n = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: n }, worker));
  return results;
};
