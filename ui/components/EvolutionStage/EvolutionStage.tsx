import Link from "next/link";
import { usePokemonPic } from "../../../hooks/usePokemonPic";
import { capitalizeFirstLetter } from "../../../utils/stringManipulation";
import { DETAILS } from "../../../constants/Routes";
import styles from "./EvolutionStage.module.css";

interface IProps {
  stage: IEvolutionStage;
}

// One avatar in the details-page evolution chain. Its own component so it can
// call usePokemonPic and swap pixel/HD sprites with the resolution toggle. Uses
// a Link (not router.push) so Next prefetches the target's data + chunk, making
// the jump to that evolution instant.
const EvolutionStage = ({ stage }: IProps) => {
  const imageUrl = usePokemonPic(stage.pixelImageUrl, stage.hdImageUrl);

  return (
    <Link href={`${DETAILS}${stage.id}`} className={styles.mon} prefetch>
      <span className={styles.avatar}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={`${stage.name}-pic`} loading="lazy" />
      </span>
      {capitalizeFirstLetter(stage.name)}
    </Link>
  );
};

export default EvolutionStage;
