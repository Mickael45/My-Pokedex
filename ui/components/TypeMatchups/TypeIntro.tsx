import styles from "../../../pages/type-interactions/TypeInteractions.module.css";
import { capitalizeFirstLetter } from "../../../utils/stringManipulation";
import { matchupSummary } from "../../../utils/pokemonTypes/matchups";
import { frMatchupIntro } from "../../../utils/pokemonTypes/frMatchupIntro";
import { FR_TYPE_LABELS } from "../../../constants/FrTypeLabels";
import { useLocale, useStrings } from "../../../hooks/useLocale";

const formatList = (items: string[]): string => {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
};

interface IProps {
  selected: string[];
}

// Renders exactly one <h1> per page plus a unique, data-driven intro paragraph
// when a type is selected (the 171 static pages); the bare landing gets a
// generic <h1> only.
const TypeIntro = ({ selected }: IProps) => {
  const locale = useLocale();
  const strings = useStrings();

  if (locale === "fr") {
    if (!selected.length) {
      return <h1 className={styles.pageTitle}>{strings.typeChartLandingTitle}</h1>;
    }
    const frLabel = (t: string) => FR_TYPE_LABELS[t] ?? capitalizeFirstLetter(t);
    const label = selected.map(frLabel).join(" / ");
    const { title, paragraph } = frMatchupIntro(label, matchupSummary(selected), frLabel);
    return (
      <>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.intro}>{paragraph}</p>
      </>
    );
  }

  if (!selected.length) {
    return <h1 className={styles.pageTitle}>Pokémon Type Interactions</h1>;
  }

  const label = selected.map(capitalizeFirstLetter).join(" / ");
  const noun = selected.length > 1 ? "Types" : "Type";
  const { weakTo, resists, immuneTo, strongAgainst } = matchupSummary(selected);
  const cap = (arr: string[]) => arr.map(capitalizeFirstLetter);

  const defense = weakTo.length
    ? `${label} Pokémon take super-effective damage from ${formatList(cap(weakTo))}.`
    : `${label} Pokémon have no common type weaknesses.`;

  const guardParts: string[] = [];
  if (resists.length) guardParts.push(`resist ${formatList(cap(resists))}`);
  if (immuneTo.length) guardParts.push(`are immune to ${formatList(cap(immuneTo))}`);
  const guard = guardParts.length ? `They ${guardParts.join(", and ")}.` : "";

  const offense = strongAgainst.length
    ? `On offense, their best coverage is against ${formatList(cap(strongAgainst))}.`
    : `On offense, they have no super-effective coverage.`;

  return (
    <>
      <h1 className={styles.pageTitle}>{`${label} ${noun} — Weaknesses & Resistances`}</h1>
      <p className={styles.intro}>{`${defense} ${guard} ${offense}`.replace(/\s+/g, " ").trim()}</p>
    </>
  );
};

export default TypeIntro;
