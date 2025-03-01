import React, { useState, useContext, memo, useEffect } from "react";
import styles from "./Home.module.css";
import LoadingContext from "../context/LoadingContext";
import PokemonContext from "../context/PokemonContext";
import useFiltering from "../hooks/useFiltering";
import { fetchAllPokemons } from "../services/fetchPokemons/fetchPokemons";
import EmptyListPlaceholder from "../ui/components/EmptyListPlaceholder/EmptyListPlaceholder";
import Header from "../ui/components/Header/Header";
import ListSortingDropdown from "../ui/components/ListSortingDropdown/ListSortingDropdown";
import Pokemon from "../ui/components/Pokemon/Pokemon";
import ErrorScreenWrapper from "../ui/components/Wrappers/ErrorScreenWrapper/ErrorScreenWrapper";
import LoadingScreenWrapper from "../ui/components/Wrappers/LoadingScreenWrapper/LoadingScreenWrapper";
import FlexboxList from "../ui/templates/FlexboxList/FlexboxList";
import Page from "../ui/templates/Page/Page";

interface IProps {
  pokemons: IBasicPokemon[];
}

const POKEMON_STACK_SIZE = 12;

const HomePage = ({ pokemons }: IProps) => {
  const filteredPokemons = useFiltering();
  const { setPokemons } = useContext(PokemonContext);
  const { setLoading, loading } = useContext(LoadingContext);
  const [numberOfPokemonShown, setNumberOfPokemonShown] = useState(POKEMON_STACK_SIZE);

  const incrementNumberOfPokemonShown = () => setNumberOfPokemonShown(numberOfPokemonShown + POKEMON_STACK_SIZE);

  const renderPokemon = (pokemon: IBasicPokemon) => <Pokemon key={pokemon.id} {...pokemon} />;

  const renderPokemons = () => filteredPokemons.slice(0, numberOfPokemonShown).map(renderPokemon);

  const renderSortDropdown = () => (filteredPokemons.length > 1 ? <ListSortingDropdown /> : <div />);

  const areThereMorePokemonsToShow = () => numberOfPokemonShown >= filteredPokemons.length;

  const updatePokemons = () => {
    if (pokemons) {
      setPokemons(pokemons);
      setLoading(false);
    }
  };

  useEffect(updatePokemons, [pokemons]);

  if (!filteredPokemons.length && !loading) {
    return <EmptyListPlaceholder text="No Pokemon Found..." />;
  }

  return (
    <>
      <Header
        title="Pokedex"
        description="Use the Advanced Search to explore Pokémon by type, weakness, Ability, and more! Search for a Pokémon by name
        or using its National Pokédex number."
      />
      <ErrorScreenWrapper>
        <LoadingScreenWrapper>
          <Page>
            <div className={styles.container}>
              {renderSortDropdown()}
              <FlexboxList hasReachedEnd={areThereMorePokemonsToShow()} showMore={incrementNumberOfPokemonShown}>
                {renderPokemons()}
              </FlexboxList>
            </div>
          </Page>
        </LoadingScreenWrapper>
      </ErrorScreenWrapper>
    </>
  );
};

export default memo(HomePage);

export async function getStaticProps() {
  const pokemons = await fetchAllPokemons();

  return { props: { pokemons } };
}

