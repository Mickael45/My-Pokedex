import Header from "../../ui/components/Header/Header";
import Page from "../../ui/templates/Page/Page";
import LegalLayout from "../../ui/components/LegalLayout/LegalLayout";
import { SITE_NAME } from "../../constants/Seo";
import { hreflangAlternates } from "../../utils/hreflang";

const PrivacyPageFr = () => (
  <>
    <Header
      title={`Politique de confidentialité | ${SITE_NAME}`}
      description={`Comment ${SITE_NAME} gère les cookies, la publicité et les données d'analyse d'audience.`}
      canonicalPath="/fr/privacy"
      alternates={hreflangAlternates("/privacy", "/fr/privacy")}
      ogLocale="fr_FR"
    />
    <Page>
      <LegalLayout heading="Politique de confidentialité" updated="19 juin 2026" updatedLabel="Dernière mise à jour">
        <p>
          Cette politique de confidentialité explique comment {SITE_NAME}
          («&nbsp;nous&nbsp;») traite les informations lorsque vous visitez ce site.
        </p>

        <h2>Cookies &amp; publicité</h2>
        <p>
          Des fournisseurs tiers, dont Google, utilisent des cookies pour diffuser
          des annonces en fonction de vos visites antérieures sur ce site et
          d&apos;autres sites. L&apos;utilisation de cookies publicitaires par Google
          et ses partenaires leur permet de vous proposer des annonces basées sur
          votre visite de ce site et/ou d&apos;autres sites sur Internet.
        </p>
        <p>
          Vous pouvez refuser la publicité personnalisée en vous rendant sur les{" "}
          <a href="https://www.google.com/settings/ads" rel="noopener noreferrer" target="_blank">
            Paramètres des annonces Google
          </a>
          . Vous pouvez également refuser l&apos;utilisation des cookies par un
          fournisseur tiers à des fins de publicité personnalisée sur{" "}
          <a href="https://www.aboutads.info/choices/" rel="noopener noreferrer" target="_blank">
            aboutads.info
          </a>{" "}
          et, dans l&apos;UE, sur{" "}
          <a href="https://www.youronlinechoices.eu/" rel="noopener noreferrer" target="_blank">
            youronlinechoices.eu
          </a>
          .
        </p>

        <h2>Analyse d&apos;audience</h2>
        <p>
          Nous utilisons Google Analytics pour comprendre l&apos;utilisation du
          site. Le stockage à des fins d&apos;analyse et de publicité est refusé par
          défaut et n&apos;est activé qu&apos;après votre consentement via la
          bannière de cookies (Google Consent Mode v2). Vous pouvez modifier votre
          choix à tout moment via le bouton «&nbsp;Paramètres des cookies&nbsp;».
        </p>

        <h2>Vos choix</h2>
        <p>
          Refuser le consentement signifie que nous ne stockons aucun cookie
          publicitaire ou d&apos;analyse&nbsp;; le site reste entièrement utilisable.
        </p>

        <h2>Contact</h2>
        <p>
          Des questions sur cette politique&nbsp;? Consultez notre{" "}
          <a href="/fr/contact">page de contact</a>.
        </p>
      </LegalLayout>
    </Page>
  </>
);

export default PrivacyPageFr;
