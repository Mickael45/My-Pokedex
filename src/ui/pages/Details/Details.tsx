import { useEffect, useState, useCallback } from "react";
import { useParams, useHistory } from "react-router-dom";
import { fetchPokemonDetailsByNameOrId } from "../../../services/fetchPokemons/fetchPokemons";
import { capitalizeFirstLetter } from "../../../utils/stringManipulation";
import ImageWithPlaceholder from "../../components/ImageWithPlaceholder/ImageWithPlaceholder";
import BasicInfo from "../../components/PokemonBasicInfo/PokemonBasicInfo";
import EvolutionChain from "../../components/EvolutionChain/EvolutionChain";
import Radar from "../../components/Radar/Radar";
import IdNavigation from "../../components/IdNavigation/IdNavigation";
import { DEFAULT_POKEMON } from "../../../constants/DefaultPokemons";
import { getPokemonPrimaryTypeColor } from "../../../utils/pokemonFormatter/pokemonFormatter";
import Page from "../../templates/Page/Page";
import styles from "./Details.module.css";
import PokemonTypes from "../../components/PokemonTypes/PokemonTypes";
import PokemonWeaknesses from "../../components/PokemonWeaknesses/PokemonWeaknesses";
interface Params {
  id: string;
}

const Details = () => {
  const { id } = useParams<Params>();
  const history = useHistory();
  const [pokemon, setPokemon] = useState<IFullPokemon>(DEFAULT_POKEMON);
  const { imageUrl, name, stats, height, weight, types, weaknesses, evolutionChain, abilities, description, category } =
    pokemon;
  const color = getPokemonPrimaryTypeColor(types);
  const basicInfo = { description, height, weight, category, types, abilities, color };

  const getPokemonById = () => {
    fetchPokemonDetailsByNameOrId(id).then(setPokemon);
  };

  useEffect(getPokemonById, [id]);

  const handleTypeClick = (type: string) =>
    history.push({
      pathname: "/",
      search: `name=${type}&field=types`,
    });

  const callBackedHandleTypeClick = useCallback(handleTypeClick, []);

  return (
    <Page>
      <div className={styles.container}>
        <IdNavigation id={id} />
        <div>{`${capitalizeFirstLetter(name)} #${id}`}</div>
        <div>
          <span>
            <ImageWithPlaceholder src={imageUrl} alt={`${name}-pic`} />
            <Radar title="Stats" axisDataList={stats} color={color} />
          </span>
          <span>
            <BasicInfo {...basicInfo} />
            <div>
              <h3>Types</h3>
              <PokemonTypes id={id} types={types} handleClick={callBackedHandleTypeClick} />
              <h3>Weaknesses</h3>
              <PokemonWeaknesses id={id} types={weaknesses} handleClick={callBackedHandleTypeClick} />
            </div>
          </span>
        </div>
        <EvolutionChain chain={evolutionChain} handleClick={callBackedHandleTypeClick} />
      </div>
    </Page>
  );
};

export default Details;
