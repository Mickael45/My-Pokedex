import { type CSSProperties } from "react";
import Link from "next/link";

import { usePokemonPic } from "../../../hooks/usePokemonPic";
import { DETAILS } from "../../../constants/Routes";
import pokemonTypesColor from "../../../constants/TypesColor.json";
import { capitalizeFirstLetter } from "../../../utils/stringManipulation";
import styles from "./PokemonAvatar.module.css";

const typeColor = (type: string) => (pokemonTypesColor as HashMap)[type] ?? "#888";

// Solid ring for a mono type; a diagonal half/half split for a dual type.
const ringBackground = (types: string[]) =>
  types.length > 1
    ? `linear-gradient(135deg, ${typeColor(types[0])} 0 47%, ${typeColor(types[1])} 53% 100%)`
    : typeColor(types[0]);

interface IProps {
  pokemon: IBasicPokemon;
}

const PokemonAvatar = ({ pokemon }: IProps) => {
  const imageUrl = usePokemonPic(pokemon.pixelImageUrl, pokemon.hdImageUrl);
  const types = pokemon.types.split(",");
  const name = capitalizeFirstLetter(pokemon.name);

  return (
    <Link
      href={`${DETAILS}${pokemon.id}`}
      className={styles.avatar}
      style={{ "--ring": ringBackground(types) } as CSSProperties}
      title={name}
      prefetch={false}
    >
      {/* alt ends in "pic" so the global low-res rule pixelates it. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={`${pokemon.name}-pic`} loading="lazy" decoding="async" />
      <span className={styles.name}>{name}</span>
    </Link>
  );
};

export default PokemonAvatar;
