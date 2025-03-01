import { memo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { getRandomTransformAnimation } from "../../animations/transform/transform";
import { capitalizeFirstLetter, formatNumberToMatchLength } from "../../../utils/stringManipulation";
import styles from "./Pokemon.module.css";
import PokemonTypes from "../PokemonTypes/PokemonTypes";
import { usePokemonPic } from "../../../hooks/usePokemonPic";
import { DETAILS } from "../../../constants/Routes";

const Pokemon = ({ name, id, pixelImageUrl, hdImageUrl, types }: IBasicPokemon) => {
  const router = useRouter();
  const imageUrl = usePokemonPic(pixelImageUrl, hdImageUrl);
  const [animation] = useState(getRandomTransformAnimation());

  const handleTagClick = () => router.push(`${DETAILS}${id}`);

  return (
    <div className={[styles.container, animation].join(" ")}>
      <Image
        src={imageUrl}
        alt={`${name}-pic`}
        placeholder="blur"
        blurDataURL={imageUrl}
        onClick={handleTagClick}
        height={200}
        width={200}
        style={{
          maxWidth: "100%",
          height: "auto"
        }} />
      <div>
        <div id="id" onClick={handleTagClick}>{`#${formatNumberToMatchLength(id)}`}</div>
        <h4 onClick={handleTagClick}>{`${capitalizeFirstLetter(name)}`}</h4>
      </div>
      <span>
        <PokemonTypes id={id} types={types} />
      </span>
    </div>
  );
};

export default memo(Pokemon);
