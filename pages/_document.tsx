import Document, { DocumentContext, Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* PWA: link the manifest + installability hints. The manifest and all
              icon sizes already live in /public; they just weren't referenced. */}
          <link rel="manifest" href="/site.webmanifest" />
          <meta name="theme-color" content="#b91c1c" />
          <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

          {/* Warm cross-origin ad/analytics connections so they stop competing
              with image + navigation fetches for the ~6-connection budget on 3G. */}
          <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://www.googletagmanager.com" />
          <link rel="dns-prefetch" href="https://googleads.g.doubleclick.net" />
          <link rel="dns-prefetch" href="https://www.google-analytics.com" />

          {/* Site-wide verification/monetization metas must live inside <head>.
              Placed between </Head> and <body> they were invalid stray nodes that
              only landed in the head via browser error-recovery. */}
          <meta name="google-adsense-account" content="ca-pub-3950888851778991" />
          <meta name="google-site-verification" content="Frk8KQk9JRTwCY5Sz2HlwbSwTdIZPlsu6lcC7M1AMrY" />

          {/* Consent Mode v2 — deny by default before any tag loads. The cookie
              banner calls gtag('consent','update',…) once the user decides.
              Must stay ABOVE GA/AdSense in load order (this is in the initial HTML). */}
          <script
            dangerouslySetInnerHTML={{
              __html:
                "window.dataLayer=window.dataLayer||[];" +
                "function gtag(){dataLayer.push(arguments);}" +
                "window.gtag=gtag;" +
                "gtag('consent','default',{" +
                "ad_storage:'denied'," +
                "ad_user_data:'denied'," +
                "ad_personalization:'denied'," +
                "analytics_storage:'denied'," +
                "wait_for_update:500});",
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
