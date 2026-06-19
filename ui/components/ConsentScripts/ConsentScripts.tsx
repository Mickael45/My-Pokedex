import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ADS_ENABLED, ADSENSE_CLIENT } from "../../../config/ads";

const ADSENSE_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;

// GA4 loads unconditionally and runs in Consent Mode (cookieless until the user
// grants). The AdSense loader only loads once ads are enabled (Phase 0 ships off).
const ConsentScripts = () => (
  <>
    {ADS_ENABLED && (
      <Script
        id="adsbygoogle-init"
        src={ADSENSE_SRC}
        strategy="afterInteractive"
        crossOrigin="anonymous"
      />
    )}
    <GoogleAnalytics gaId="G-6FS0YBDE8T" />
  </>
);

export default ConsentScripts;
