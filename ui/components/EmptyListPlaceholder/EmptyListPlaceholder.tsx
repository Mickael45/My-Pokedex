import styles from "./EmptyListPlaceholder.module.css";
import Image from "next/image";
import { usePokemonPic } from "../../../hooks/usePokemonPic";

interface IProps {
  text: string;
}

const EmptyListPlaceholder = ({ text }: IProps) => {
  const gif = usePokemonPic("/images/sleepy-pikachu.gif", "/images/sleepy-pikachu-hd.gif");
  const width = gif === "/images/sleepy-pikachu.gif" ? 200 : 350;

  return (
    <div className={styles.container}>
      <Image
        src={gif}
        alt="sleepy pikachu"
        placeholder="blur"
        blurDataURL={gif}
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
