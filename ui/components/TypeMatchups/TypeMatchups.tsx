import styles from "../../../pages/type-interactions/TypeInteractions.module.css";
import pokemonTypesColor from "../../../constants/TypesColor.json";
import { capitalizeFirstLetter } from "../../../utils/stringManipulation";
import { defendingRows, attackingRows, MatchupRow } from "../../../utils/pokemonTypes/matchups";
import { FR_TYPE_LABELS } from "../../../constants/FrTypeLabels";
import { useLocale, useStrings } from "../../../hooks/useLocale";

const typeColor = (type: string) => (pokemonTypesColor as HashMap)[type] ?? "#888";

const MAX_FACTOR = 4;
const TIER_CLASS: Record<number, string> = { 4: "t4", 2: "t2", 0.5: "th", 0.25: "tq", 0: "t0" };

interface IProps {
  selected: string[];
}

const TypeMatchups = ({ selected }: IProps) => {
  const locale = useLocale();
  const strings = useStrings();
  const typeLabel = (type: string) =>
    locale === "fr" ? (FR_TYPE_LABELS[type] ?? capitalizeFirstLetter(type)) : capitalizeFirstLetter(type);
  const combo = selected.map(typeLabel).join(" / ");
  const defending = selected.length ? defendingRows(selected) : [];
  const attacking = selected.length ? attackingRows(selected) : [];

  const renderBars = (icon: string, title: string, description: string, data: MatchupRow[]) => (
    <section className={styles.block}>
      <div className={styles.secHead}>
        <span className={styles.ic} aria-hidden="true">
          {icon}
        </span>
        <h2 className={styles.blockTitle}>{title}</h2>
      </div>
      <p className={styles.secDesc}>{description}</p>
      <div className={styles.panel}>
        {data.length === 0 ? (
          <p className={styles.empty}>{strings.typeChartNeutralOnly}</p>
        ) : (
          data.map(({ type, mult }) => (
            <div key={type} className={`${styles.row} ${styles[TIER_CLASS[mult]]}`}>
              <span className={styles.typeChip} style={{ background: typeColor(type) }}>
                {typeLabel(type)}
              </span>
              <span className={styles.track}>
                <span className={styles.fill} style={{ width: `${(mult / MAX_FACTOR) * 100}%` }} />
              </span>
              <span className={styles.mult}>x{mult}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );

  if (!selected.length) {
    return <p className={styles.prompt}>{strings.typeChartPrompt}</p>;
  }

  return (
    <>
      {renderBars(
        "🛡️",
        strings.typeChartDefending,
        strings.typeChartDefendingDesc.replace("{combo}", combo),
        defending
      )}
      {renderBars(
        "⚔️",
        strings.typeChartAttacking,
        strings.typeChartAttackingDesc.replace("{combo}", combo),
        attacking
      )}
    </>
  );
};

export default TypeMatchups;
