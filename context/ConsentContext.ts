import { createContext } from "react";
import { CONSENT, UNSET } from "../constants/Consent";

interface IContextProps {
  consent: CONSENT;
  setConsent: (consent: CONSENT) => void;
}

export default createContext<IContextProps>({
  consent: UNSET,
  setConsent: () => {},
});
