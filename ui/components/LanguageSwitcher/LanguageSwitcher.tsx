import { useContext } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "./LanguageSwitcher.module.css";
import { useLocale } from "../../../hooks/useLocale";
import SwitchTargetContext from "../../../context/SwitchTargetContext";
import { switchHref } from "../../../utils/switchHref";

// A minimal same-page locale toggle, shown on BOTH locales. It links to the
// counterpart of the current page in the other language — never an automatic
// redirect. The href comes from the page-provided `SwitchTargetContext` when
// available (detail / type-combo pages), else a deterministic fallback.
const LanguageSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const switchTarget = useContext(SwitchTargetContext);

  const other = locale === "fr" ? "en" : "fr";
  const href = switchHref(locale, router.pathname, switchTarget);
  const label = other === "fr" ? "Français" : "English";
  // The <html lang> of the destination, for correct assistive-tech pronunciation.
  const hrefLang = other;

  return (
    <Link href={href} className={styles.switcher} hrefLang={hrefLang}>
      {label}
    </Link>
  );
};

export default LanguageSwitcher;
