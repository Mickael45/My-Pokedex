import Link from "next/link";
import { ABOUT, PRIVACY, CONTACT, TERMS } from "../../../constants/Routes";
import { SITE_NAME } from "../../../constants/Seo";
import styles from "./Footer.module.css";

interface IProps {
  // Rendered inside a detail page's type-coloured content area (white text on the
  // themed background) rather than as the standalone band other pages use.
  embedded?: boolean;
}

const Footer = ({ embedded = false }: IProps) => (
  <footer className={`${styles.footer}${embedded ? ` ${styles.embedded}` : ""}`}>
    <nav className={styles.links} aria-label="Footer">
      <Link href={ABOUT}>About</Link>
      <Link href={PRIVACY}>Privacy</Link>
      <Link href={CONTACT}>Contact</Link>
      <Link href={TERMS}>Terms</Link>
    </nav>
    <p className={styles.disclaimer}>
      {SITE_NAME} is an unofficial fan-made reference. It is not affiliated with,
      endorsed by, or sponsored by Nintendo, Game Freak, or The Pokémon Company.
      Pokémon and Pokémon character names are trademarks of Nintendo. All
      stat tables and type-matchup data on this site are independently compiled facts.
    </p>
    <p>© {SITE_NAME}</p>
  </footer>
);

export default Footer;
