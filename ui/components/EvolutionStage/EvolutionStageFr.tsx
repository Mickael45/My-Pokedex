import Link from "next/link";
import { usePokemonPic } from "../../../hooks/usePokemonPic";
import { capitalizeFirstLetter } from "../../../utils/stringManipulation";
import { FR_POKEMON } from "../../../constants/Routes";
import styles from "./EvolutionStage.module.css";

interface IProps {
  stage: IEvolutionStage;
}

// French mirror of EvolutionStage: one avatar in the details-page evolution
// chain. Its own component so it can call usePokemonPic and swap pixel/HD
// sprites with the resolution toggle. Uses a Link (not router.push) so Next
// prefetches the target's data + chunk, making the jump instant. Labels and
// hrefs point at the French /fr/pokemon/ routes and localized names.
const EvolutionStageFr = ({ stage }: IProps) => {
  const imageUrl = usePokemonPic(stage.pixelImageUrl, stage.hdImageUrl);

  return (
    <Link href={`${FR_POKEMON}${stage.slug}`} className={styles.mon} prefetch>
      <span className={styles.avatar}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={`Sprite de ${stage.frName ?? stage.name}`} loading="lazy" />
      </span>
      {stage.frName ?? capitalizeFirstLetter(stage.name)}
    </Link>
  );
};

export default EvolutionStageFr;
