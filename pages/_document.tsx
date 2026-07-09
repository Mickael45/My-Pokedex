import Document, { DocumentContext, DocumentInitialProps, Html, Head, Main, NextScript } from "next/document";

/**
 * Pure helper: map a Next route pattern (ctx.pathname, e.g. "/fr/pokemon/[slug]")
 * to the document language. "fr" for the /fr locale subtree, "en" otherwise.
 */
export const langForPathname = (pathname: string): "en" | "fr" =>
  pathname === "/fr" || pathname.startsWith("/fr/") ? "fr" : "en";

type MyDocumentProps = DocumentInitialProps & { lang: "en" | "fr" };

class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx: DocumentContext): Promise<MyDocumentProps> {
    const initialProps = await Document.getInitialProps(ctx);
    const lang = langForPathname(ctx.pathname);

    return { ...initialProps, lang };
  }

  render() {
    return (
      <Html lang={this.props.lang ?? "en"}>
        <Head>
          {/* PWA: link the manifest + installability hints. The manifest and all
              icon sizes already live in /public; they just weren't referenced. */}
          <link rel="manifest" href="/site.webmanifest" />
          <meta name="theme-color" content="#b91c1c" />
          <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

          {/* Warm cross-origin analytics connections so they stop competing with
              image + navigation fetches for the ~6-connection budget on 3G. */}
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <link rel="dns-prefetch" href="https://www.google-analytics.com" />

          {/* Site-wide verification meta must live inside <head>. Placed between
              </Head> and <body> it was an invalid stray node that only landed in
              the head via browser error-recovery. */}
          <meta name="google-site-verification" content="Frk8KQk9JRTwCY5Sz2HlwbSwTdIZPlsu6lcC7M1AMrY" />

          {/* Consent Mode v2 — deny by default before any tag loads. The cookie
              banner calls gtag('consent','update',…) once the user decides.
              Must stay ABOVE GA in load order (this is in the initial HTML). */}
          <script
            dangerouslySetInnerHTML={{
              __html:
                "window.dataLayer=window.dataLayer||[];" +
                "function gtag(){dataLayer.push(arguments);}" +
                "window.gtag=gtag;" +
                "gtag('consent','default',{" +
                "analytics_storage:'granted'});" +
                "gtag('consent','default',{" +
                "analytics_storage:'denied'," +
                "wait_for_update:500," +
                "region:['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH']});",
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
