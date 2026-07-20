import Link from "next/link";
import { ABOUT, PRIVACY, CONTACT, TERMS } from "../../../constants/Routes";
import { SITE_NAME } from "../../../constants/Seo";
import { useStrings } from "../../../hooks/useLocale";
import styles from "./Footer.module.css";

interface IProps {
  // Rendered inside a detail page's type-coloured content area (white text on the
  // themed background) rather than as the standalone band other pages use.
  embedded?: boolean;
}

const Footer = ({ embedded = false }: IProps) => {
  const strings = useStrings();

  return (
    <footer className={`${styles.footer}${embedded ? ` ${styles.embedded}` : ""}`}>
      <nav className={styles.links} aria-label={strings.footerNavLabel}>
        <Link href={ABOUT}>{strings.footerAbout}</Link>
        <Link href={PRIVACY}>{strings.footerPrivacy}</Link>
        <Link href={CONTACT}>{strings.footerContact}</Link>
        <Link href={TERMS}>{strings.footerTerms}</Link>
      </nav>
      <p className={styles.disclaimer}>
        {SITE_NAME} {strings.footerDisclaimer}
      </p>
      <p>© {SITE_NAME}</p>
    </footer>
  );
};

export default Footer;
