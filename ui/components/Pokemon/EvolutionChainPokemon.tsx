import { memo, useState } from "react";
import { useRouter } from "next/router";
import { getRandomTransformAnimation } from "../../animations/transform/transform";
import { capitalizeFirstLetter, formatNumberToMatchLength } from "../../../utils/stringManipulation";
import styles from "./Pokemon.module.css";
import PokemonTypes from "../PokemonTypes/PokemonTypes";
import { usePokemonPic } from "../../../hooks/usePokemonPic";
import { cardImageUrls } from "../../../utils/pokemonFormatter/pokemonFormatter";
import { DETAILS } from "../../../constants/Routes";

// The original list-card layout, kept for the details-page evolution chain
// (whose CSS targets this exact DOM: image, id/name, types). The list cards use
// the redesigned TCG `Pokemon` component instead.
const EvolutionChainPokemon = ({ name, id, types }: IBasicPokemon) => {
  const router = useRouter();
  const { pixelImageUrl, hdImageUrl } = cardImageUrls(id);
  const imageUrl = usePokemonPic(pixelImageUrl, hdImageUrl);
  const [animation] = useState(getRandomTransformAnimation());

  const handleTagClick = () => router.push(`${DETAILS}${id}`);

  return (
    <div className={[styles.container, animation].join(" ")}>
      <img
        src={imageUrl}
        alt={`${name}-pic`}
        onClick={handleTagClick}
        height={200}
        width={200}
        style={{ maxWidth: "100%", height: "auto" }}
      />
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

export default memo(EvolutionChainPokemon);
