import Head from "next/head";
import {
  SITE_NAME,
  SITE_LOCALE,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
} from "../../../constants/Seo";

type JsonLd = Record<string, unknown>;

interface IProps {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  ogType?: string;
  twitterCard?: "summary" | "summary_large_image";
  jsonLd?: JsonLd | JsonLd[];
}

const Header = ({
  title,
  description,
  canonicalPath = "/",
  image = DEFAULT_OG_IMAGE,
  ogType = "website",
  twitterCard = "summary_large_image",
  jsonLd,
}: IProps) => {
  const canonical = absoluteUrl(canonicalPath);
  const ogImage = absoluteUrl(image);
  const jsonLdItems = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Head>
      <title>{title}</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={SITE_LOCALE} />

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      <meta name="theme-color" content="#b91c1c" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16.png" />
      <link rel="apple-touch-icon" href="/icons/icon-512.png" />
      <link rel="manifest" href="/site.webmanifest" />

      <link rel="preload" href="/fonts/pixelPokemonFont.ttf" as="font" crossOrigin="" />
      <link rel="preload" href="/fonts/hdPokemonFont.woff" as="font" crossOrigin="" />
      <link rel="preload" href="/fonts/hdPokemonFont-bold.woff" as="font" crossOrigin="" />

      {jsonLdItems.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </Head>
  );
};

export default Header;
