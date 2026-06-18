import { useContext } from "react";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import ConsentContext from "../../../context/ConsentContext";
import { GRANTED } from "../../../constants/Consent";

const ADSENSE_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3950888851778991";

const ConsentScripts = () => {
  const { consent } = useContext(ConsentContext);

  if (consent !== GRANTED) {
    return null;
  }

  return (
    <>
      <Script
        id="adsbygoogle-init"
        src={ADSENSE_SRC}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
      <GoogleAnalytics gaId="G-6FS0YBDE8T" />
    </>
  );
};

export default ConsentScripts;
