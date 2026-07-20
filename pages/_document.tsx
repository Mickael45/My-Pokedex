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

          {/* Site-wide verification meta must live inside <head>. Placed between
              </Head> and <body> it was an invalid stray node that only landed in
              the head via browser error-recovery. */}
          <meta name="google-site-verification" content="Frk8KQk9JRTwCY5Sz2HlwbSwTdIZPlsu6lcC7M1AMrY" />
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
