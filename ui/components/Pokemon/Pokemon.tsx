import { memo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { getPokemonPrimaryTypeColor } from "../../../utils/pokemonFormatter/pokemonFormatter";
import { usePokemonPic } from "../../../hooks/usePokemonPic";
import useCenterSpotlight from "../../../hooks/useCenterSpotlight";
import { formatNumberToMatchLength } from "../../../utils/stringManipulation";
import { DETAILS } from "../../../constants/Routes";
import pokemonTypesColor from "../../../constants/TypesColor.json";
import styles from "./Pokemon.module.css";

const MAX_STAT_VALUE = 255;

const typeColor = (type: string) => (pokemonTypesColor as HashMap)[type] ?? "#888";

const Pokemon = ({
  name,
  id,
  pixelImageUrl,
  hdImageUrl,
  types,
  stats,
  evolvesFrom,
  priority = false,
}: IBasicPokemon & { priority?: boolean }) => {
  const imageUrl = usePokemonPic(pixelImageUrl, hdImageUrl);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const cardRef = useRef<HTMLAnchorElement | null>(null);
  const isFocused = useCenterSpotlight(cardRef);

  // If the image is already complete on mount (preloaded or HTTP-cached), the
  // load event has already fired and onLoad never runs — mark it loaded here.
  const heroRef = (node: HTMLImageElement | null) => {
    if (node && node.complete && node.naturalWidth > 0) setHeroLoaded(true);
  };

  const typeList = types.split(",");
  const cardColor = getPokemonPrimaryTypeColor(types);

  // Stats and the pre-evolution ship with the SSG props, so everything renders
  // instantly. stats is the compact [hp, attack, defense, speed] tuple.
  const [hp, attack, defense, speed] = stats;

  const renderStat = (label: string, value: number | null) => {
    const barWidth = value === null ? 0 : Math.min((value / MAX_STAT_VALUE) * 100, 100);

    return (
      <div className={styles.stat}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.track}>
          <span className={styles.fill} style={{ width: `${barWidth}%` }} />
        </span>
        <span className={styles.statValue}>{value === null ? "—" : value}</span>
      </div>
    );
  };

  return (
    <Link
      ref={cardRef}
      href={`${DETAILS}${id}`}
      prefetch
      className={`${styles.card} ${isFocused ? styles.cardFocused : ""}`}
      style={{ "--type": cardColor } as CSSProperties}
    >
      <span className={styles.watermark} aria-hidden="true">
        #{formatNumberToMatchLength(id)}
      </span>

      {evolvesFrom && (
        <span className={styles.evoBadge} title={`Evolves from ${evolvesFrom.name}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={evolvesFrom.image} alt={`${evolvesFrom.name}-pic`} loading="lazy" />
        </span>
      )}

      <span className={`${styles.heroWrap} ${heroLoaded ? styles.heroWrapLoaded : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={heroRef}
          className={`${styles.heroImg} ${heroLoaded ? styles.heroImgLoaded : ""}`}
          src={imageUrl}
          alt={`${name}-pic`}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setHeroLoaded(true)}
        />
      </span>

      <div className={styles.head}>
        {/* Plain span (not a heading) so the global high-res heading sizes can't
            override the fixed size and cause a layout shift. */}
        <span className={styles.name} title={name}>
          {name}
        </span>
        <span className={styles.hp}>HP {hp}</span>
      </div>

      <div className={styles.glass}>
        <div className={styles.types}>
          {typeList.map((type) => (
            <span key={type} className={styles.typeChip} style={{ background: typeColor(type) }}>
              {type}
            </span>
          ))}
        </div>
        {renderStat("Attack", attack)}
        {renderStat("Defense", defense)}
        {renderStat("Speed", speed)}
      </div>
    </Link>
  );
};

export default memo(Pokemon);
