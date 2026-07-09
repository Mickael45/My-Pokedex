import { GoogleAnalytics } from "@next/third-parties/google";

// GA4 loads unconditionally and runs in Consent Mode (cookieless until the user
// grants via the cookie banner).
const ConsentScripts = () => <GoogleAnalytics gaId="G-6FS0YBDE8T" />;

export default ConsentScripts;
