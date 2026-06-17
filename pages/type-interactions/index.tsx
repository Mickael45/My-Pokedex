import { memo } from "react";

import styles from "./TypeInteractions.module.css";
import Header from "../../ui/components/Header/Header";
import TypePicker from "../../ui/components/TypePicker/TypePicker";
import Page from "../../ui/templates/Page/Page";
import { usePokemonTypesFromQuery } from "../../hooks/useQueryParams";
import { incomingFactor, bestDamage } from "../../utils/pokemonTypes/effectiveness";
import * as Types from "../../constants/Types";
import pokemonTypesColor from "../../constants/TypesColor.json";
import { capitalizeFirstLetter } from "../../utils/stringManipulation";

const ALL_TYPES = Object.values(Types);
const typeColor = (type: string) => (pokemonTypesColor as HashMap)[type] ?? "#888";

// Bar fill per multiplier, on a perceptual (non-linear) scale so resistances
// and weaknesses both read clearly.
const BAR_PCT: Record<number, number> = { 0: 6, 0.25: 24, 0.5: 44, 1: 62, 2: 81, 4: 100 };
const TIER_CLASS: Record<number, string> = { 4: "t4", 2: "t2", 0.5: "th", 0.25: "tq", 0: "t0" };

interface Row {
  type: string;
  mult: number;
}

const TypeInteractionsPage = () => {
  const selected = usePokemonTypesFromQuery().split(",").filter(Boolean);
  const combo = selected.map(capitalizeFirstLetter).join(" / ");

  // Non-neutral matchups only, strongest first.
  const rows = (score: (type: string) => number): Row[] =>
    ALL_TYPES.map((type) => ({ type, mult: score(type) }))
      .filter((row) => row.mult !== 1)
      .sort((a, b) => b.mult - a.mult);

  const defending = selected.length ? rows((type) => incomingFactor(selected, type)) : [];
  const attacking = selected.length ? rows((type) => bestDamage(selected, [type])) : [];

  const renderBars = (icon: string, title: string, description: string, data: Row[]) => (
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
                <span className={styles.fill} style={{ width: `${BAR_PCT[mult]}%` }} />
              </span>
              <span className={styles.mult}>×{mult}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );

  return (
    <>
      <Header
        title="Type Interactions"
        description="Pick a type to see the damage it takes from and deals to every other type."
      />
      <Page>
        <div className={styles.container}>
          <TypePicker />

          {selected.length === 0 ? (
            <p className={styles.prompt}>Select a type (or two) above to see its matchups.</p>
          ) : (
            <>
              {renderBars(
                "🛡️",
                "Defending",
                `Damage ${combo} takes from each attacking type — biggest weaknesses first.`,
                defending
              )}
              {renderBars(
                "⚔️",
                "Attacking",
                `Damage ${combo}'s best move deals to each type — best targets first.`,
                attacking
              )}
            </>
          )}
        </div>
      </Page>
    </>
  );
};

export default memo(TypeInteractionsPage);
