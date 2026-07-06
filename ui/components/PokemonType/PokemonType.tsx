import { type CSSProperties } from "react";
import { capitalizeFirstLetter } from "../../../utils/stringManipulation";
import styles from "./PokemonType.module.css";
import { getTypeColor, getTypeChipColor } from "../../../utils/typeColors";
import { useRouter } from "next/router";
import { HOME } from "../../../constants/Routes";
import { FR_TYPE_LABELS } from "../../../constants/FrTypeLabels";
import { useLocale } from "../../../hooks/useLocale";
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
  const locale = useLocale();

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
        style={{ "--c": getTypeColor(type), "--chip": getTypeChipColor(type) } as CSSProperties}
        className={`${styles.filterChip} ${selected ? styles.selected : ""}`}
        data-type={type}
        data-checked={selected}
        onClick={handleClick}
      >
        <TypeIcon type={type} className={styles.filterIcon} />
        <span className={styles.filterLabel}>
          {locale === "fr" ? (FR_TYPE_LABELS[type] ?? capitalizeFirstLetter(type)) : capitalizeFirstLetter(type)}
        </span>
      </span>
    );
  }

  return (
    <span
      id="type"
      style={{ "--c": getTypeColor(type), "--chip": getTypeChipColor(type) } as CSSProperties}
      className={styles.typeContainer}
      data-type={type}
      onClick={handleClick}
    >
      <TypeIcon type={type} className={styles.typeIcon} />
      {capitalizeFirstLetter(type)}
      {children}
    </span>
  );
};

export default PokemonType;
