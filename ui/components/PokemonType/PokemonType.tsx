import { capitalizeFirstLetter } from "../../../utils/stringManipulation";
import styles from "./PokemonType.module.css";
import pokemonTypesColor from "../../../constants/TypesColor.json";
import { useRouter } from "next/router";
import { HOME } from "../../../constants/Routes";
const { typeContainer } = styles;

interface IProps {
  type: PokemonType;
  children?: string;
  handleTypeClick?: Function;
}

const PokemonType = ({ type, children = "", handleTypeClick }: IProps) => {
  const router = useRouter();
  const castedPokemonTypesColor = pokemonTypesColor as HashMap;

  const handleClick = () =>
    handleTypeClick
      ? handleTypeClick(type)
      : router.push({
          pathname: HOME,
          search: `types=${type}`,
        });

  return (
    <span
      id="type"
      style={{ background: castedPokemonTypesColor[type] }}
      className={typeContainer}
      data-type={type}
      onClick={handleClick}
    >
      {capitalizeFirstLetter(type)}
      {children}
    </span>
  );
};

export default PokemonType;
