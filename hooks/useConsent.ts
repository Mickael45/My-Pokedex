// hooks/useConsent.ts
import { useEffect, useState } from "react";
import { CONSENT, CONSENT_STORAGE_KEY, GRANTED, DENIED, UNSET } from "../constants/Consent";

const isValid = (value: string | null): value is CONSENT =>
  value === GRANTED || value === DENIED;

const useConsent = () => {
  // Always start UNSET so server and first client render match (no hydration drift).
  const [consent, setConsentState] = useState<CONSENT>(UNSET);

  useEffect(() => {
    const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (isValid(stored)) {
      setConsentState(stored);
    }
  }, []);

  const setConsent = (next: CONSENT) => {
    setConsentState(next);
    if (next === UNSET) {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    } else {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, next);
    }
  };

  return { consent, setConsent };
};

export default useConsent;
