import React, { memo, useEffect, useMemo, useState } from "react";

import styles from "./TypeInteractions.module.css";
import Header from "../../ui/components/Header/Header";
import PokemonAvatar from "../../ui/components/PokemonAvatar/PokemonAvatar";
import TypePicker from "../../ui/components/TypePicker/TypePicker";
import Page from "../../ui/templates/Page/Page";
import { usePokemonTypesFromQuery } from "../../hooks/useQueryParams";
import { fetchAllPokemons } from "../../services/fetchPokemons/fetchPokemons";
import { bestDamage, DAMAGE_TIERS } from "../../utils/pokemonTypes/effectiveness";
import { capitalizeFirstLetter } from "../../utils/stringManipulation";

const DESKTOP_LIMIT = 10;
const MOBILE_LIMIT = 5;

const DEFENDING_LABELS: Record<number, string> = {
  4: "Double weak",
  2: "Weak to",
  0.5: "Resists",
  0.25: "Double resist",
  0: "Immune to",
};
const ATTACKING_LABELS: Record<number, string> = {
  4: "Quad damage",
  2: "Super effective",
  0.5: "Resisted by",
  0.25: "Doubly resisted",
  0: "No effect on",
};
const TIER_CLASS: Record<number, string> = { 4: "t4", 2: "t2", 0.5: "th", 0.25: "tq", 0: "t0" };

const factorLabel = (factor: number) => `${factor}`;

// Renders nothing until asked: a type click only paints labels + counts, then
// each "See N more" click reveals one chunk (10 desktop / 5 mobile). This keeps
// chip clicks instant — no avatar (and no image request) is mounted up front.
// Resets to hidden when the list changes (i.e. a new type is picked).
const AvatarShelf = ({ pokemons }: { pokemons: IBasicPokemon[] }) => {
  const [limit, setLimit] = useState(DESKTOP_LIMIT);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const apply = () => setLimit(query.matches ? MOBILE_LIMIT : DESKTOP_LIMIT);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => setVisible(0), [pokemons, limit]);

  const shown = pokemons.slice(0, visible);
  const allShown = visible >= pokemons.length;
  const nextChunk = Math.min(limit, pokemons.length - visible);

  return (
    <>
      {shown.length > 0 && (
        <div className={styles.mons}>
          {shown.map((pokemon) => (
            <PokemonAvatar key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      )}
      <button
        type="button"
        className={styles.seeMore}
        onClick={() => setVisible((value) => (allShown ? 0 : value + limit))}
      >
        {allShown ? "See less" : `See ${nextChunk} more`}
      </button>
    </>
  );
};

interface IProps {
  pokemons: IBasicPokemon[];
}

const TypeInteractionsPage = ({ pokemons }: IProps) => {
  const selected = usePokemonTypesFromQuery().split(",").filter(Boolean);
  const selectedKey = selected.join(",");
  const combo = selected.map(capitalizeFirstLetter).join(" / ");

  const buckets = useMemo(() => {
    if (!selectedKey) return null;
    const types = selectedKey.split(",");

    const bucketize = (score: (pokemon: IBasicPokemon) => number) => {
      const grouped = new Map<number, IBasicPokemon[]>();
      pokemons.forEach((pokemon) => {
        const factor = score(pokemon);
        const list = grouped.get(factor);
        list ? list.push(pokemon) : grouped.set(factor, [pokemon]);
      });
      return grouped;
    };

    return {
      roster: pokemons.filter((pokemon) => types.every((type) => pokemon.types.split(",").includes(type))),
      defending: bucketize((pokemon) => bestDamage(pokemon.types.split(","), types)),
      attacking: bucketize((pokemon) => bestDamage(types, pokemon.types.split(","))),
    };
  }, [selectedKey, pokemons]);

  const renderMatchup = (
    icon: string,
    title: string,
    description: string,
    grouped: Map<number, IBasicPokemon[]>,
    labels: Record<number, string>
  ) => {
    const tiers = DAMAGE_TIERS.filter((tier) => (grouped.get(tier)?.length ?? 0) > 0);

    return (
      <section className={styles.block}>
        <div className={styles.secHead}>
          <span className={styles.ic} aria-hidden="true">
            {icon}
          </span>
          <h2 className={styles.blockTitle}>{title}</h2>
        </div>
        <p className={styles.secDesc}>{description}</p>
        <div className={styles.panel}>
          {tiers.length === 0 ? (
            <p className={styles.empty}>No notable interactions for this selection.</p>
          ) : (
            tiers.map((tier) => (
              <div key={tier} className={`${styles.cat} ${styles[TIER_CLASS[tier]]}`}>
                <div className={styles.catHead}>
                  <span className={styles.badge}>×{factorLabel(tier)}</span>
                  <span className={styles.catLabel}>
                    <span className={styles.catName}>{labels[tier]}</span>
                    <span className={styles.catCount}>{(grouped.get(tier) as IBasicPokemon[]).length} found</span>
                  </span>
                </div>
                <div className={styles.catBody}>
                  <AvatarShelf pokemons={grouped.get(tier) as IBasicPokemon[]} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    );
  };

  return (
    <>
      <Header
        title="Type Interactions"
        description="Pick a type to see the Pokémon that wield it, who threatens it, and who it beats."
      />
      <Page>
        <div className={styles.container}>
          <TypePicker />

          {!buckets ? (
            <p className={styles.prompt}>
              Select a type (or two) above to see the Pokémon that wield it, who threatens it, and who it beats.
            </p>
          ) : (
            <>
              <section className={styles.block}>
                <div className={styles.secHead}>
                  <span className={styles.ic} aria-hidden="true">
                    ⭐
                  </span>
                  <h2 className={styles.blockTitle}>Pokémon of this type</h2>
                </div>
                <p className={styles.secDesc}>
                  {buckets.roster.length === 0
                    ? `There are no Pokémon of the ${combo}${selected.length > 1 ? " dual type combination" : " type"}.`
                    : `${buckets.roster.length} Pokémon ${selected.length > 1 ? "are exactly" : "have"} ${combo}.`}
                </p>
                <div className={styles.panel}>
                  {buckets.roster.length === 0 ? (
                    <p className={styles.empty}>Try a single type, or a different pairing.</p>
                  ) : (
                    <div className={`${styles.catBody} ${styles.solo}`}>
                      <AvatarShelf pokemons={buckets.roster} />
                    </div>
                  )}
                </div>
              </section>

              {renderMatchup(
                "🛡️",
                "Defending",
                `Pokémon whose best move hits ${combo} — your biggest threats first.`,
                buckets.defending,
                DEFENDING_LABELS
              )}
              {renderMatchup(
                "⚔️",
                "Attacking",
                `Pokémon that ${combo}'s best move lands on — your best targets first.`,
                buckets.attacking,
                ATTACKING_LABELS
              )}
            </>
          )}
        </div>
      </Page>
    </>
  );
};

export default memo(TypeInteractionsPage);

export async function getStaticProps() {
  const pokemons = await fetchAllPokemons();

  return { props: { pokemons } };
}
