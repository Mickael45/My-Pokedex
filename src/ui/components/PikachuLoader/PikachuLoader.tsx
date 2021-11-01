import { useState, useEffect } from "react";
import pikachuGif from "../../../assets/running-pikachu.gif";
import pikachuGifHD from "../../../assets/running-pikachu-hd.gif";
import styles from "./PikachuLoader.module.css";
import AnimatedText from "../AnimatedText/AnimatedText";
import { usePokemonPic } from "../../../hooks/usePokemonPic";

const TEXT_UPDATE_INTERVAL_MS = 4000;

const LoadingTexts = [
  `Pikachu ! Go! `,
  "He should be back in a sec...",
  "Don't panic, he's on his way back !",
  "Does Anyone Actually Read This ?",
];

const PikachuLoader = () => {
  const [loadingText, setLoadingText] = useState(LoadingTexts[0]);
  const gif = usePokemonPic(pikachuGif, pikachuGifHD);

  const generateNextIndex = () => {
    const areTextsTheSame = (text: string) => text === loadingText;
    const currentTextIndex = LoadingTexts.findIndex(areTextsTheSame);
    const incrementedTextIndex = currentTextIndex + 1;

    return incrementedTextIndex === LoadingTexts.length ? 0 : incrementedTextIndex;
  };

  const changeLoadingText = () => setLoadingText(LoadingTexts[generateNextIndex()]);

  const triggerInterval = () => {
    const interval = setInterval(changeLoadingText, TEXT_UPDATE_INTERVAL_MS);

    const clearCreatedInterval = () => clearInterval(interval);

    return clearCreatedInterval;
  };

  useEffect(triggerInterval, [loadingText]);

  return (
    <div id="loading-screen" className={styles.container}>
      <div>
        <img src={gif} alt="pika pika" />
        <AnimatedText text={loadingText} />
      </div>
    </div>
  );
};

export default PikachuLoader;
