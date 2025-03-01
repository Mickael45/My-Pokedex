import Image from "next/image";
import { ErrorTypeToMessageHashMap } from "../../../constants/ErrorTypeToMessageHashMap";
import { usePokemonPic } from "../../../hooks/usePokemonPic";
import styles from "./ErrorScreen.module.css";

interface IProps {
  type: ErrorType;
}

export const ErrorScreen = ({ type }: IProps) => {
  const gif = usePokemonPic("/images/surprised-pikachu.png", "/images/surprised-pikachu-hd.png");

  return (
    <div id="error-screen" className={styles.container}>
      <div>
        <Image
          src={gif}
          alt="surprised pikachu"
          height={300}
          width={300}
          style={{
            maxWidth: "100%",
            height: "auto"
          }} />
        <div>{ErrorTypeToMessageHashMap[type]}</div>
      </div>
    </div>
  );
};
