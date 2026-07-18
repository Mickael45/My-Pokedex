import Head from "next/head";
import { ErrorTypeToMessageHashMap } from "../../../constants/ErrorTypeToMessageHashMap";
import { SITE_NAME } from "../../../constants/Seo";
import { usePokemonPic } from "../../../hooks/usePokemonPic";
import styles from "./ErrorScreen.module.css";

interface IProps {
  type: ErrorType;
}

export const ErrorScreen = ({ type }: IProps) => {
  const gif = usePokemonPic("/images/surprised-pikachu.png", "/images/surprised-pikachu-hd.png");
  const message = ErrorTypeToMessageHashMap[type];

  return (
    <>
      {/* Error pages ship no <Header>, so give them their own <title> (axe
          document-title) and a single top-level heading for page structure. */}
      <Head>
        <title>{`${message} — ${SITE_NAME}`}</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div id="error-screen" className={styles.container}>
        <div>
          <img
            src={gif}
            alt="surprised pikachu"
            height={300}
            width={300}
            style={{
              maxWidth: "100%",
              height: "auto"
            }} />
          <h1 style={{ margin: 0, font: "inherit" }}>{message}</h1>
        </div>
      </div>
    </>
  );
};
