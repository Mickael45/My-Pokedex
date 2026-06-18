import { type CSSProperties } from "react";
import { useRouter } from "next/router";

import * as FilteringTypes from "../../../constants/Types";
import { TYPE_INTERACTIONS } from "../../../constants/Routes";
import { usePokemonTypesFromQuery } from "../../../hooks/useQueryParams";
import { toTypeSlug } from "../../../utils/typeSlug";
import pokemonTypesColor from "../../../constants/TypesColor.json";
import { capitalizeFirstLetter } from "../../../utils/stringManipulation";
import styles from "./TypePicker.module.css";

const OPTIONS = Object.values(FilteringTypes);
const typeColor = (type: string) => (pokemonTypesColor as HashMap)[type] ?? "#888";

interface IProps {
  selected?: string[];
}

// Pill selector for the Type Interactions dossier. Caps selection at two and
// navigates to the canonical static slug page so every matchup has one indexable URL.
const TypePicker = ({ selected: selectedProp }: IProps) => {
  const router = useRouter();
  const querySelected = usePokemonTypesFromQuery().split(",").filter(Boolean);
  const selected = selectedProp ?? querySelected;

  const toggle = (type: string) => {
    const next = selected.includes(type)
      ? selected.filter((current) => current !== type)
      : [...selected, type].slice(-2);

    router.push(next.length ? `${TYPE_INTERACTIONS}/${toTypeSlug(next)}` : TYPE_INTERACTIONS);
  };

  return (
    <div className={styles.picker}>
      <div className={styles.label}>
        <span>Type(s)</span>
        <span className={styles.hint}>select up to 2</span>
      </div>
      <div className={styles.chips}>
        {OPTIONS.map((type) => (
          <button
            key={type}
            type="button"
            className={`${styles.chip} ${selected.includes(type) ? styles.on : ""}`}
            style={{ "--c": typeColor(type) } as CSSProperties}
            onClick={() => toggle(type)}
          >
            {capitalizeFirstLetter(type)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TypePicker;
