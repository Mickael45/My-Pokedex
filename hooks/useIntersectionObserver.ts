import { RefObject, useEffect, useState } from "react";

const useIntersectionObserver = (
  elementRef: RefObject<Element | null> | null,
  { threshold = 0, root = null, rootMargin = "0%" }: IntersectionObserverInit
): IntersectionObserverEntry | undefined => {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  const updateEntry = ([newEntry]: IntersectionObserverEntry[]): void => setEntry(newEntry);

  useEffect(() => {
    const node = elementRef?.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || !node) {
      return;
    }

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementRef]);

  return entry;
};

export default useIntersectionObserver;
