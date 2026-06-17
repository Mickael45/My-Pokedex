import styles from "./EmptyListPlaceholder.module.css";
import { usePokemonPic } from "../../../hooks/usePokemonPic";

interface IProps {
  text: string;
}

const EmptyListPlaceholder = ({ text }: IProps) => {
  const gif = usePokemonPic("/images/sleepy-pikachu.gif", "/images/sleepy-pikachu-hd.gif");
  const width = gif === "/images/sleepy-pikachu.gif" ? 200 : 350;

  return (
    <div className={styles.container}>
      <img
        src={gif}
        alt="sleepy pikachu"
        height={200}
        width={width}
        style={{
          maxWidth: "100%",
          height: "auto"
        }} />
      {text}
    </div>
  );
};

export default EmptyListPlaceholder;
