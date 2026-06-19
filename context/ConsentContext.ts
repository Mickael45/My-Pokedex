import { createContext } from "react";
import { CONSENT, UNSET } from "../constants/Consent";

interface IContextProps {
  consent: CONSENT;
  setConsent: (consent: CONSENT) => void;
  // False until localStorage has been read on the client; the banner waits for
  // this so a returning user never sees it flash before their stored choice loads.
  hydrated: boolean;
}

export default createContext<IContextProps>({
  consent: UNSET,
  setConsent: () => {},
  hydrated: false,
});
