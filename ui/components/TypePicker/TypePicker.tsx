import { useEffect, type CSSProperties } from "react";
import { useRouter } from "next/router";

import * as FilteringTypes from "../../../constants/Types";
import { TYPE_INTERACTIONS, FR_TYPE_INTERACTIONS } from "../../../constants/Routes";
import { usePokemonTypesFromQuery } from "../../../hooks/useQueryParams";
import { getTypeColor, getTypeChipColor } from "../../../utils/typeColors";
import { toTypeSlug } from "../../../utils/typeSlug";
import { toFrTypeSlug } from "../../../utils/frTypeSlug";
import { capitalizeFirstLetter } from "../../../utils/stringManipulation";
import { FR_TYPE_LABELS } from "../../../constants/FrTypeLabels";
import { useLocale, useStrings } from "../../../hooks/useLocale";
import TypeIcon from "../PokemonType/typeIcons";
import styles from "./TypePicker.module.css";

const OPTIONS = Object.values(FilteringTypes);

interface IProps {
  selected?: string[];
}

// Pill selector for the Type Interactions dossier. Caps selection at two and
// navigates to the canonical static slug page so every matchup has one indexable URL.
const TypePicker = ({ selected: selectedProp }: IProps) => {
  const router = useRouter();
  const locale = useLocale();
  const strings = useStrings();
  const querySelected = usePokemonTypesFromQuery().split(",").filter(Boolean);
  const selected = selectedProp ?? querySelected;

  // The destination each chip navigates to (toggle in/out, cap at two).
  const hrefFor = (type: string) => {
    const next = selected.includes(type)
      ? selected.filter((current) => current !== type)
      : [...selected, type].slice(-2);

    if (locale === "fr") {
      return next.length ? `${FR_TYPE_INTERACTIONS}/${toFrTypeSlug(next)}` : FR_TYPE_INTERACTIONS;
    }
    return next.length ? `${TYPE_INTERACTIONS}/${toTypeSlug(next)}` : TYPE_INTERACTIONS;
  };

  // The combo pages are pre-rendered at build time, but a chip tap was still
  // waiting on their page-data + shared chunk to download on the click itself.
  // Warm every reachable target up front (and again when the selection changes)
  // so the navigation is instant. router.prefetch is a no-op in dev.
  useEffect(() => {
    OPTIONS.forEach((type) => router.prefetch(hrefFor(type)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.join(",")]);

  const toggle = (type: string) => router.push(hrefFor(type));

  return (
    <div className={styles.picker}>
      <div className={styles.label}>
        <span>{strings.typePickerLabel}</span>
        <span className={styles.hint}>{strings.typePickerHint}</span>
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
            {locale === "fr" ? (FR_TYPE_LABELS[type] ?? capitalizeFirstLetter(type)) : capitalizeFirstLetter(type)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TypePicker;
