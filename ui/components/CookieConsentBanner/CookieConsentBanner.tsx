import { useContext } from "react";
import ConsentContext from "../../../context/ConsentContext";
import { GRANTED, DENIED, UNSET } from "../../../constants/Consent";
import styles from "./CookieConsentBanner.module.css";

const CookieConsentBanner = () => {
  const { consent, setConsent, hydrated } = useContext(ConsentContext);

  // Wait for localStorage to be read before showing anything, so a returning
  // user who already chose never sees the banner flash in and out.
  if (!hydrated || consent !== UNSET) {
    return null;
  }

  return (
    <div className={styles.banner} role="dialog" aria-label="Cookie consent">
      <p className={styles.text}>
        We use cookies for analytics. Accept to help us improve the site, or reject to
        browse without them.
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.button} ${styles.reject}`}
          onClick={() => setConsent(DENIED)}
        >
          Reject
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.accept}`}
          onClick={() => setConsent(GRANTED)}
        >
          Accept
        </button>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
