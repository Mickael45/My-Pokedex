import Header from "../ui/components/Header/Header";
import Page from "../ui/templates/Page/Page";
import LegalLayout from "../ui/components/LegalLayout/LegalLayout";
import { SITE_NAME } from "../constants/Seo";

const PrivacyPage = () => (
  <>
    <Header
      title={`Privacy Policy | ${SITE_NAME}`}
      description={`How ${SITE_NAME} handles cookies, advertising, and analytics data.`}
      canonicalPath="/privacy"
    />
    <Page>
      <LegalLayout heading="Privacy Policy" updated="June 19, 2026">
        <p>
          This Privacy Policy explains how {SITE_NAME} (&quot;we&quot;, &quot;us&quot;)
          handles information when you visit this site.
        </p>

        <h2>Cookies &amp; advertising</h2>
        <p>
          Third-party vendors, including Google, use cookies to serve ads based on
          your prior visits to this and other websites. Google&apos;s use of
          advertising cookies enables it and its partners to serve ads to you based
          on your visit to this and/or other sites on the Internet.
        </p>
        <p>
          You may opt out of personalized advertising by visiting{" "}
          <a href="https://www.google.com/settings/ads" rel="noopener noreferrer" target="_blank">
            Google Ads Settings
          </a>
          . You can also opt out of a third-party vendor&apos;s use of cookies for
          personalized advertising at{" "}
          <a href="https://www.aboutads.info/choices/" rel="noopener noreferrer" target="_blank">
            aboutads.info
          </a>{" "}
          and, in the EU, at{" "}
          <a href="https://www.youronlinechoices.eu/" rel="noopener noreferrer" target="_blank">
            youronlinechoices.eu
          </a>
          .
        </p>

        <h2>Analytics</h2>
        <p>
          We use Google Analytics to understand site usage. Analytics and
          advertising storage are denied by default and are only enabled after you
          consent via the cookie banner (Google Consent Mode v2). You can change
          your choice at any time using the &quot;Cookie settings&quot; control.
        </p>

        <h2>Your choices</h2>
        <p>
          Declining consent means we do not store advertising or analytics cookies;
          the site remains fully usable.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? See our <a href="/contact">contact page</a>.
        </p>
      </LegalLayout>
    </Page>
  </>
);

export default PrivacyPage;
