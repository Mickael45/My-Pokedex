import React, { memo, useMemo } from "react";

import styles from "./TypeInteractions.module.css";
import { TYPE_INTERACTIONS } from "../../constants/Routes";
import { usePokemonTypesFromQuery } from "../../hooks/useQueryParams";
import Header from "../../ui/components/Header/Header";
import PokemonAvatar from "../../ui/components/PokemonAvatar/PokemonAvatar";
import TypesSelector from "../../ui/components/TypesSelector/TypesSelector";
import Page from "../../ui/templates/Page/Page";
import { fetchAllPokemons } from "../../services/fetchPokemons/fetchPokemons";
import { bestDamage, DAMAGE_TIERS } from "../../utils/pokemonTypes/effectiveness";
import { capitalizeFirstLetter } from "../../utils/stringManipulation";

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

const factorLabel = (factor: number) =>
  factor === 0 ? "0" : factor === 0.25 ? "¼" : factor === 0.5 ? "½" : `${factor}`;

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
      // Pokémon that have exactly the selected typing.
      roster: pokemons.filter((pokemon) => types.every((type) => pokemon.types.split(",").includes(type))),
      // How hard each Pokémon's best move hits the selected typing.
      defending: bucketize((pokemon) => bestDamage(pokemon.types.split(","), types)),
      // How hard the selected typing's best move hits each Pokémon.
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
            tiers.map((tier) => {
              const list = grouped.get(tier) as IBasicPokemon[];
              return (
                <div key={tier} className={`${styles.cat} ${styles[TIER_CLASS[tier]]}`}>
                  <div className={styles.catHead}>
                    <span className={styles.badge}>×{factorLabel(tier)}</span>
                    <span className={styles.catLabel}>
                      <span className={styles.catName}>{labels[tier]}</span>
                      <span className={styles.catCount}>{list.length} found</span>
                    </span>
                  </div>
                  <div className={styles.mons}>
                    {list.map((pokemon) => (
                      <PokemonAvatar key={pokemon.id} pokemon={pokemon} />
                    ))}
                  </div>
                </div>
              );
            })
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
        <div id="type-interactions" className={styles.container}>
          <TypesSelector pathname={TYPE_INTERACTIONS} />

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
                {buckets.roster.length === 0 ? (
                  <p className={styles.empty}>
                    There are no Pokémon of the {combo}
                    {selected.length > 1 ? " dual type combination" : " type"}.
                  </p>
                ) : (
                  <>
                    <p className={styles.secDesc}>
                      {buckets.roster.length} Pokémon {selected.length > 1 ? "are exactly" : "have"} {combo}.
                    </p>
                    <div className={styles.mons}>
                      {buckets.roster.map((pokemon) => (
                        <PokemonAvatar key={pokemon.id} pokemon={pokemon} />
                      ))}
                    </div>
                  </>
                )}
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
