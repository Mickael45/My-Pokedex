import { ReactNode } from "react";
import styles from "./LegalLayout.module.css";

interface IProps {
  heading: string;
  updated: string;
  children: ReactNode;
}

const LegalLayout = ({ heading, updated, children }: IProps) => (
  <article className={styles.wrap}>
    <h1>{heading}</h1>
    <p className={styles.updated}>Last updated: {updated}</p>
    {children}
  </article>
);

export default LegalLayout;
