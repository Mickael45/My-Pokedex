import PokemonType from "../PokemonType/PokemonType";
import styles from "./PokemonWeaknesses.module.css";

interface IProps {
  id: string;
  types: Weakness[];
}

const PokemonWeaknesses = ({ id, types }: IProps) => {
  const renderType = ({ type, factor }: Weakness) => (
    <PokemonType key={`${id}-${type}`} type={type}>
      {` (x${factor})`}
    </PokemonType>
  );
  const renderTypes = () => types.map(renderType);

  return <span className={styles.container}>{renderTypes()}</span>;
};

export default PokemonWeaknesses;
