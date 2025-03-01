import { memo } from "react";
import styles from "./AnimatedText.module.css";

const AnimatedText = ({ text }) => {
  const renderChar = (letter, index) => (
    <p
      key={`${letter}-${index}-${text}`}
      data-char={letter}
      className={styles.char}
      style={{ "--char-index": index, "--word-length": text.length }}
    >
      {letter}
    </p>
  );

  const renderWord = (word, offset) => {
    const chars = Array.from(word);

    const renderCharacters = (char, index) => renderChar(char, offset + index + 1);

    return (
      <span key={`${word}-${offset}`}>
        {renderCharacters(" ", offset)}
        {chars.map(renderCharacters)}
      </span>
    );
  };

  const renderTextCharacters = () => {
    let offset = 0;

    const renderWordTags = (word) => {
      const wordTag = renderWord(word, offset);
      offset += word.length + 1;

      return wordTag;
    };
    return text.split(" ").map(renderWordTags);
  };

  return <span className={styles.container}>{renderTextCharacters()}</span>;
};

export default memo(AnimatedText);
