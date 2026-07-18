import Link from "next/link";
import type { BrowseItem } from "../../../utils/browseIndex";
import styles from "./BrowseIndex.module.css";

interface IProps {
  heading: string;
  ariaLabel: string;
  items: BrowseItem[];
}

// A server-rendered, crawlable index of internal links, rendered inside a native
// <details> so it's collapsed for humans but fully present in the static HTML —
// crawlers read <details> content regardless of open state. This is what pulls
// the ~1025 detail pages and every type-matchup combo to within one click of a
// hub, fixing the orphaned/deep-page problem without bloating the visible UI or
// competing with the LCP card grid above it. Plain <a>/<Link> only; no JS gate.
const BrowseIndex = ({ heading, ariaLabel, items }: IProps) => {
  if (!items.length) return null;

  return (
    <nav className={styles.browse} aria-label={ariaLabel}>
      <details className={styles.details}>
        <summary className={styles.summary}>{heading}</summary>
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </details>
    </nav>
  );
};

export default BrowseIndex;
