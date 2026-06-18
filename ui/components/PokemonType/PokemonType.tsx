import { type CSSProperties } from "react";
import { capitalizeFirstLetter } from "../../../utils/stringManipulation";
import styles from "./PokemonType.module.css";
import pokemonTypesColor from "../../../constants/TypesColor.json";
import { useRouter } from "next/router";
import { HOME } from "../../../constants/Routes";
import TypeIcon from "./typeIcons";

interface IProps {
  type: PokemonType;
  children?: string;
  handleTypeClick?: (type: PokemonType) => void;
  /** "filter" renders the icon-style pill used by the type filter (matches the
   *  Type Interactions dossier: dimmed by default, glowing ring when selected). */
  variant?: "filter";
  selected?: boolean;
}

const PokemonType = ({ type, children = "", handleTypeClick, variant, selected = false }: IProps) => {
  const router = useRouter();
  const castedPokemonTypesColor = pokemonTypesColor as HashMap;
  const color = castedPokemonTypesColor[type];

  const handleClick = () =>
    handleTypeClick
      ? handleTypeClick(type)
      : router.push({
          pathname: HOME,
          search: `types=${type}`,
        });

  if (variant === "filter") {
    return (
      <span
        id="type"
        style={{ background: color, "--c": color } as CSSProperties}
        className={`${styles.filterChip} ${selected ? styles.selected : ""}`}
        data-type={type}
        data-checked={selected}
        onClick={handleClick}
      >
        <TypeIcon type={type} className={styles.filterIcon} />
        <span className={styles.filterLabel}>{capitalizeFirstLetter(type)}</span>
      </span>
    );
  }

  return (
    <span
      id="type"
      style={{ background: color }}
      className={styles.typeContainer}
      data-type={type}
      onClick={handleClick}
    >
      {capitalizeFirstLetter(type)}
      {children}
    </span>
  );
};

export default PokemonType;
