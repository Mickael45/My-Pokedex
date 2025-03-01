import Document, { DocumentContext, Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);

    return initialProps;
  }

  render() {
    return (
      <Html lang="en">
        <Head />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3950888851778991"
          crossOrigin="anonymous"></script>
        <meta name="google-adsense-account" content="ca-pub-3950888851778991"></meta>
        <meta name="google-site-verification" content="Frk8KQk9JRTwCY5Sz2HlwbSwTdIZPlsu6lcC7M1AMrY" />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
