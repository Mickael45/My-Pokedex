import { type CSSProperties } from "react";
import { useRouter } from "next/router";

import * as FilteringTypes from "../../../constants/Types";
import { TYPE_INTERACTIONS } from "../../../constants/Routes";
import { usePokemonTypesFromQuery } from "../../../hooks/useQueryParams";
import { getTypeColor, getTypeChipColor } from "../../../utils/typeColors";
import { capitalizeFirstLetter } from "../../../utils/stringManipulation";
import TypeIcon from "../PokemonType/typeIcons";
import styles from "./TypePicker.module.css";

const OPTIONS = Object.values(FilteringTypes);

// Pill selector for the Type Interactions dossier. Caps the selection at two
// (a Pokémon has at most two types) and mirrors it into the `?types=` query so
// the page stays shareable.
const TypePicker = () => {
  const router = useRouter();
  const selected = usePokemonTypesFromQuery().split(",").filter(Boolean);

  const toggle = (type: string) => {
    const next = selected.includes(type)
      ? selected.filter((current) => current !== type)
      : [...selected, type].slice(-2); // drop the oldest once two are picked

    // Shallow: update the URL without re-running data fetching, so toggling is instant.
    router.push({ pathname: TYPE_INTERACTIONS, search: next.length ? `types=${next.join(",")}` : "" }, undefined, {
      shallow: true,
    });
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
            style={{ "--c": getTypeColor(type), "--chip": getTypeChipColor(type) } as CSSProperties}
            onClick={() => toggle(type)}
          >
            <TypeIcon type={type} className={styles.chipIcon} />
            {capitalizeFirstLetter(type)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TypePicker;
