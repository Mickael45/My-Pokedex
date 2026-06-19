import Header from "../ui/components/Header/Header";
import Page from "../ui/templates/Page/Page";
import LegalLayout from "../ui/components/LegalLayout/LegalLayout";
import { SITE_NAME } from "../constants/Seo";

const ContactPage = () => (
  <>
    <Header
      title={`Contact | ${SITE_NAME}`}
      description={`How to reach the ${SITE_NAME} team for questions, corrections, or feedback.`}
      canonicalPath="/contact"
    />
    <Page>
      <LegalLayout heading="Contact" updated="June 19, 2026">
        <p>
          For questions, data corrections, or feedback about {SITE_NAME}, email{" "}
          <a href="mailto:mickaelgomesconsulting@gmail.com">
            mickaelgomesconsulting@gmail.com
          </a>
          .
        </p>
        <p>We aim to respond within a few business days.</p>
      </LegalLayout>
    </Page>
  </>
);

export default ContactPage;
