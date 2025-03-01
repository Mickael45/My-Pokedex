import PokemonType from "../PokemonType/PokemonType";
import styles from "./PokemonTypes.module.css";

interface IProps {
  id: number | string;
  types: string;
}

const PokemonTypes = ({ id, types }: IProps) => {
  const renderType = (type: PokemonType) => <PokemonType key={`${id}-${type}`} type={type} />;
  const renderTypes = () => {
    const splitTypes = types.split(",") as PokemonType[];

    return splitTypes.map(renderType);
  };

  return <span className={styles.container}>{renderTypes()}</span>;
};

export default PokemonTypes;
