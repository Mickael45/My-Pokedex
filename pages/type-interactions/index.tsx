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

// Bar fill is linear against the x4 maximum, so x2 reads as a half bar.
const MAX_FACTOR = 4;
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
                <span className={styles.fill} style={{ width: `${(mult / MAX_FACTOR) * 100}%` }} />
              </span>
              <span className={styles.mult}>x{mult}</span>
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
                `Damage ${combo} takes from each attacking type, worst matchups first.`,
                defending
              )}
              {renderBars(
                "⚔️",
                "Attacking",
                `Damage ${combo} deals to each type with its best move, best matchups first.`,
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
