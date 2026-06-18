import styles from "../../../pages/type-interactions/TypeInteractions.module.css";
import pokemonTypesColor from "../../../constants/TypesColor.json";
import { capitalizeFirstLetter } from "../../../utils/stringManipulation";
import { defendingRows, attackingRows, MatchupRow } from "../../../utils/pokemonTypes/matchups";

const typeColor = (type: string) => (pokemonTypesColor as HashMap)[type] ?? "#888";

const MAX_FACTOR = 4;
const TIER_CLASS: Record<number, string> = { 4: "t4", 2: "t2", 0.5: "th", 0.25: "tq", 0: "t0" };

interface IProps {
  selected: string[];
}

const TypeMatchups = ({ selected }: IProps) => {
  const combo = selected.map(capitalizeFirstLetter).join(" / ");
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
          <p className={styles.empty}>Only neutral matchups for this selection.</p>
        ) : (
          data.map(({ type, mult }) => (
            <div key={type} className={`${styles.row} ${styles[TIER_CLASS[mult]]}`}>
              <span className={styles.typeChip} style={{ background: typeColor(type) }}>
                {capitalizeFirstLetter(type)}
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
    return <p className={styles.prompt}>Select a type (or two) above to see its matchups.</p>;
  }

  return (
    <>
      {renderBars("🛡️", "Defending", `Damage ${combo} takes from each attacking type, worst matchups first.`, defending)}
      {renderBars("⚔️", "Attacking", `Damage ${combo} deals to each type with its best move, best matchups first.`, attacking)}
    </>
  );
};

export default TypeMatchups;
