import { ReactNode } from "react";
import styles from "./LegalLayout.module.css";

interface IProps {
  heading: string;
  updated: string;
  // Localizable label before the date (default English); FR pages pass "Dernière
  // mise à jour" so the whole trust page reads in one language.
  updatedLabel?: string;
  children: ReactNode;
}

const LegalLayout = ({ heading, updated, updatedLabel = "Last updated", children }: IProps) => (
  <article className={styles.wrap}>
    <h1>{heading}</h1>
    <p className={styles.updated}>{updatedLabel}: {updated}</p>
    {children}
  </article>
);

export default LegalLayout;
