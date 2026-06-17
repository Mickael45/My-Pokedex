import { usePokemonPic } from "../../../hooks/usePokemonPic";
import { capitalizeFirstLetter } from "../../../utils/stringManipulation";
import styles from "./EvolutionStage.module.css";

interface IProps {
  stage: IEvolutionStage;
  onSelect: (id: number) => void;
}

// One avatar in the details-page evolution chain. Its own component so it can
// call usePokemonPic and swap pixel/HD sprites with the resolution toggle.
const EvolutionStage = ({ stage, onSelect }: IProps) => {
  const imageUrl = usePokemonPic(stage.pixelImageUrl, stage.hdImageUrl);

  return (
    <button type="button" className={styles.mon} onClick={() => onSelect(stage.id)}>
      <span className={styles.avatar}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={`${stage.name}-pic`} loading="lazy" />
      </span>
      {capitalizeFirstLetter(stage.name)}
    </button>
  );
};

export default EvolutionStage;
