import Header from "../ui/components/Header/Header";
import Page from "../ui/templates/Page/Page";
import LegalLayout from "../ui/components/LegalLayout/LegalLayout";
import { SITE_NAME } from "../constants/Seo";
import { hreflangAlternates } from "../utils/hreflang";

const ContactPage = () => (
  <>
    <Header
      title={`Contact ${SITE_NAME} — Questions, Corrections & Feedback`}
      description={`How to reach the ${SITE_NAME} team about data corrections, bug reports, questions or feedback on the Pokédex, its base stats, type charts and evolution data.`}
      canonicalPath="/contact"
      alternates={hreflangAlternates("/contact", "/fr/contact")}
    />
    <Page>
      <LegalLayout heading="Contact" updated="June 19, 2026">
        <p>
          For questions, data corrections, or feedback about {SITE_NAME}, email{" "}
          <a href="mailto:doozy_34@proton.me">
            doozy_34@proton.me
          </a>
          .
        </p>
        <p>We aim to respond within a few business days.</p>
      </LegalLayout>
    </Page>
  </>
);

export default ContactPage;
