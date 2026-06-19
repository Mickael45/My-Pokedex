import { Fragment, useContext, useEffect, type CSSProperties } from "react";
import ReactDOM from "react-dom";
import Link from "next/link";

import styles from "./Details.module.css";
import { DETAILS } from "../../constants/Routes";
import { MAX_POKEMON_ID_ALLOWED } from "../../constants/FetchPokemons";
import { LOW_RESOLUTION } from "../../constants/Resolution";
import LoadingContext from "../../context/LoadingContext";
import ResolutionContext from "../../context/ResolutionContext";
import { usePokemonPic } from "../../hooks/usePokemonPic";
import { fetchAllPokemons, fetchPokemonDetailsByNameOrId } from "../../services/fetchPokemons/fetchPokemons";
import Header from "../../ui/components/Header/Header";
import EvolutionStage from "../../ui/components/EvolutionStage/EvolutionStage";
import AdSlot from "../../ui/components/AdSlot/AdSlot";
import Footer from "../../ui/components/Footer/Footer";
import ErrorScreenWrapper from "../../ui/components/Wrappers/ErrorScreenWrapper/ErrorScreenWrapper";
import { getPokemonPrimaryTypeColor } from "../../utils/pokemonFormatter/pokemonFormatter";
import { getTypeColor, getTypeChipColor } from "../../utils/typeColors";
import TypeIcon from "../../ui/components/PokemonType/typeIcons";
import { capitalizeFirstLetter, formatNumberToMatchLength } from "../../utils/stringManipulation";
import { convertCmtoMeterString, cmToFeetString, joinValueWithUnit, kgToPoundsString } from "../../utils/unitConverter";
import { breadcrumbJsonLd } from "../../utils/structuredData";

const MAX_STAT_VALUE = 200;
const FACTOR_LABEL: Record<number, string> = { 0: "0", 0.25: "0.25", 0.5: "0.5", 1: "1", 2: "2", 4: "4" };

const DetailsPage = ({
  id,
  pixelImageUrl,
  hdImageUrl,
  name,
  stats,
  height,
  weight,
  types,
  defensiveEffectiveness,
  offensiveEffectiveness,
  evolutionChain,
  abilities,
  description,
  category,
}: IFullPokemon) => {
  const { setLoading } = useContext(LoadingContext);
  const { resolution } = useContext(ResolutionContext);
  const imageUrl = usePokemonPic(pixelImageUrl, hdImageUrl);
  const color = getPokemonPrimaryTypeColor(types);
  const typeList = types.split(",");

  const setLoadingToFalse = () => setLoading(false);
  useEffect(setLoadingToFalse, [id, setLoading]);

  // Warm the browser cache for the neighbouring Pokemon so Prev/Next shows the
  // image instantly instead of waiting on a fresh request. Pixel art is tiny so it
  // is always prefetched; the heavier HD art is only prefetched in high-res mode.
  useEffect(() => {
    const preload = (targetId: number) => {
      if (targetId < 1 || targetId > MAX_POKEMON_ID_ALLOWED) return;
      const urls = [`/pokemon/pixel/${targetId}.webp`];
      if (resolution !== LOW_RESOLUTION) {
        urls.push(`/pokemon/full/${formatNumberToMatchLength(targetId)}.webp`);
      }
      urls.forEach((src) => ReactDOM.preload(src, { as: "image" }));
    };
    preload(id - 1);
    preload(id + 1);
  }, [id, resolution]);

  const effClass = (factor: number) =>
    factor === 0 ? styles.immune : factor > 1 ? styles.weak : factor < 1 ? styles.resist : styles.normal;

  const renderEffectivenessGrid = (label: string, list: ITypeEffectiveness[]) => (
    <div className={styles.effBlock}>
      <div className={styles.effLabel}>{label}</div>
      <div className={styles.eff}>
        {list.map(({ type, factor }) => (
          <span
            key={type}
            className={`${styles.effTile} ${effClass(factor)}`}
            style={{ "--c": getTypeColor(type), "--chip": getTypeChipColor(type) } as CSSProperties}
            title={`${capitalizeFirstLetter(type)}: x${FACTOR_LABEL[factor]}`}
          >
            <TypeIcon type={type} className={styles.effIcon} />
            <span className={styles.effType}>{capitalizeFirstLetter(type)}</span>
            <span className={styles.effMult}>x{FACTOR_LABEL[factor]}</span>
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Header
        title={`${capitalizeFirstLetter(name)} (#${formatNumberToMatchLength(id)}) — Stats, Types, Weaknesses & Evolution | Pokédex`}
        description={`${capitalizeFirstLetter(name)} is a ${types
          .split(",")
          .map(capitalizeFirstLetter)
          .join("/")}-type Pokémon (#${formatNumberToMatchLength(id)}). See base stats, type weaknesses and resistances, abilities, and its full evolution line.`}
        canonicalPath={`/details/${id}`}
        image={hdImageUrl}
        imageAlt={`${capitalizeFirstLetter(name)} official artwork`}
        ogType="article"
        twitterCard="summary"
        jsonLd={breadcrumbJsonLd([
          { name: "Pokédex", path: "/" },
          { name: capitalizeFirstLetter(name), path: `/details/${id}` },
        ])}
      />
      <ErrorScreenWrapper>
        {/* No loading gate: the page is SSG and every field comes from
            getStaticProps, so the H1, Pokédex entry, base stats and matchups must
            be server-rendered into the HTML — not hidden behind the client-only
            Pikachu loader — for crawlers and AI features to read them. */}
        <div className={styles.wrap} style={{ "--type": color } as CSSProperties}>
            <div className={styles.inner}>
              <nav className={styles.nav}>
                {/* Links (not router.push) so Next prefetches the neighbour's data + chunk
                    while you're on the page — the first Prev/Next click is then instant
                    instead of waiting on a fetch. Boundaries stay disabled buttons since
                    an anchor can't be :disabled. */}
                {id > 1 ? (
                  <Link href={`${DETAILS}${id - 1}`} className={styles.navBtn} prefetch>
                    &lt; Prev
                  </Link>
                ) : (
                  <button type="button" className={styles.navBtn} disabled>
                    &lt; Prev
                  </button>
                )}
                {id < MAX_POKEMON_ID_ALLOWED ? (
                  <Link href={`${DETAILS}${id + 1}`} className={styles.navBtn} prefetch>
                    Next &gt;
                  </Link>
                ) : (
                  <button type="button" className={styles.navBtn} disabled>
                    Next &gt;
                  </button>
                )}
              </nav>

              <header className={styles.hero}>
                <span className={styles.watermark} aria-hidden="true">#{formatNumberToMatchLength(id)}</span>
                <div className={styles.heroTop}>
                  <h1>{capitalizeFirstLetter(name)}</h1>
                  <div className={styles.types}>
                    {typeList.map((type) => (
                      <span
                        key={type}
                        className={styles.typeChip}
                        style={{ "--c": getTypeColor(type), "--chip": getTypeChipColor(type) } as CSSProperties}
                      >
                        <TypeIcon type={type} className={styles.typeChipIcon} />
                        {capitalizeFirstLetter(type)}
                      </span>
                    ))}
                  </div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={styles.heroImg} src={imageUrl} alt={`${capitalizeFirstLetter(name)} official artwork`} />
              </header>

              <div className={styles.panes}>
                <section className={`${styles.glass} ${styles.entry}`}>
                  <div className={styles.paneTitle}>Pokedex entry</div>
                  <p>{description}</p>
                </section>

                <section className={styles.glass}>
                  <div className={styles.paneTitle}>Base stats</div>
                  {stats.map((stat) => (
                    <div className={styles.statline} key={stat.label}>
                      <span className={styles.statLabel}>{stat.label}</span>
                      <div className={styles.bar}>
                        <i style={{ width: `${Math.min((stat.value / MAX_STAT_VALUE) * 100, 100)}%` }} />
                      </div>
                      <span className={styles.statNum}>{stat.value}</span>
                    </div>
                  ))}
                </section>

                <section className={styles.glass}>
                  <div className={styles.paneTitle}>Profile</div>
                  <div className={styles.spec}>
                    <b>Height</b><span>{`${convertCmtoMeterString(height)} (${cmToFeetString(height)})`}</span>
                    <b>Weight</b><span>{`${joinValueWithUnit(weight, "kg")} (${kgToPoundsString(weight)})`}</span>
                    <b>Category</b><span>{category}</span>
                    <b>Abilities</b><span>{abilities.map(capitalizeFirstLetter).join(", ")}</span>
                  </div>
                </section>

                <section className={`${styles.glass} ${styles.effWrap}`}>
                  <div className={styles.paneTitle}>Type effectiveness</div>
                  {renderEffectivenessGrid("Damage taken", defensiveEffectiveness)}
                  {renderEffectivenessGrid("Damage dealt", offensiveEffectiveness)}
                </section>

                {evolutionChain.length > 1 && (
                  <section className={`${styles.glass} ${styles.evoWrap}`}>
                    <div className={styles.paneTitle}>Evolution</div>
                    <div className={styles.evo}>
                      {evolutionChain.map((stage, index) => (
                        <Fragment key={stage.id}>
                          {index > 0 && (
                            <span className={styles.evoStep}>
                              <em>{stage.level ? `Lv. ${stage.level}` : "→"}</em>
                            </span>
                          )}
                          <EvolutionStage stage={stage} />
                        </Fragment>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Full-width ad band below the panels — kept out of the 1fr 1fr
                  grid so Stats|Profile stay side by side when ads are enabled. */}
              <AdSlot name="detailBelowStats" />
            </div>

            {/* Footer lives inside the type-coloured area (the global one is
                suppressed in _app for this route) and pins to the bottom of it. */}
            <Footer embedded />
          </div>
      </ErrorScreenWrapper>
    </>
  );
};

export default DetailsPage;

export async function getStaticPaths() {
  const pokemonsData = await fetchAllPokemons();
  const paths = pokemonsData.map((pokemon: IBasicPokemon) => ({ params: { id: pokemon.id.toString() } }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { id: string } }) {
  const pokemonData = await fetchPokemonDetailsByNameOrId(params.id);

  return { props: { ...pokemonData } };
}
