import { useContext, useState } from "react";
import PokemonContext from "../../../context/PokemonContext";
import Dropdown from "../Dropdown/Dropdown";
import { ASCENDING_ID, DESCENDING_ID, ASCENDING_NAME, DESCENDING_NAME } from "../../../constants/SortingTypes";
import {
  sortByNumberFieldAsc,
  sortByNumberFieldDesc,
  sortByStringFieldAsc,
  sortByStringFieldDesc,
} from "../../../utils/arraySorting";

const sortingOptions = [ASCENDING_ID, DESCENDING_ID, ASCENDING_NAME, DESCENDING_NAME];

type FormattingFunction = (array: IBasicPokemon[]) => IBasicPokemon[];

const sortingMap: { [key: string]: FormattingFunction } = {
  [ASCENDING_ID]: (pokemons: IBasicPokemon[]) => sortByNumberFieldAsc(pokemons, "id"),
  [DESCENDING_ID]: (pokemons: IBasicPokemon[]) => sortByNumberFieldDesc(pokemons, "id"),
  [ASCENDING_NAME]: (pokemons: IBasicPokemon[]) => sortByStringFieldAsc(pokemons, "name"),
  [DESCENDING_NAME]: (pokemons: IBasicPokemon[]) => sortByStringFieldDesc(pokemons, "name"),
};

const ListSortingDropdown = () => {
  const [sortingType, setSortingType] = useState<SortingType>(ASCENDING_ID);
  const { pokemons, setPokemons } = useContext(PokemonContext);

  const handleOptionSelectionChange = (option: SortingType) => {
    setPokemons(sortingMap[option](pokemons));
    setSortingType(option);
  };

  return (
    <Dropdown<SortingType>
      selectedOption={sortingType}
      options={sortingOptions}
      handleOptionSelectionChange={handleOptionSelectionChange}
    />
  );
};

export default ListSortingDropdown;
