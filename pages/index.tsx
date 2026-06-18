import React, { useState, useContext, memo, useEffect } from "react";
import ReactDOM from "react-dom";
import styles from "./Home.module.css";
import LoadingContext from "../context/LoadingContext";
import PokemonContext from "../context/PokemonContext";
import ResolutionContext from "../context/ResolutionContext";
import { LOW_RESOLUTION } from "../constants/Resolution";
import useFiltering from "../hooks/useFiltering";
import { fetchAllPokemons } from "../services/fetchPokemons/fetchPokemons";
import EmptyListPlaceholder from "../ui/components/EmptyListPlaceholder/EmptyListPlaceholder";
import Header from "../ui/components/Header/Header";
import Pokemon from "../ui/components/Pokemon/Pokemon";
import ErrorScreenWrapper from "../ui/components/Wrappers/ErrorScreenWrapper/ErrorScreenWrapper";
import FlexboxList from "../ui/templates/FlexboxList/FlexboxList";
import Page from "../ui/templates/Page/Page";

interface IProps {
  pokemons: IBasicPokemon[];
}

const POKEMON_STACK_SIZE = 12;
const ABOVE_THE_FOLD = 6;

const HomePage = ({ pokemons }: IProps) => {
  const filteredPokemons = useFiltering();
  const { resolution } = useContext(ResolutionContext);
  const { setPokemons, pokemons: ctxPokemons } = useContext(PokemonContext);
  const { setLoading, loading } = useContext(LoadingContext);
  const [numberOfPokemonShown, setNumberOfPokemonShown] = useState(POKEMON_STACK_SIZE);

  // The context is seeded client-side (useEffect below), so on the server and the
  // first client render it's empty. Fall back to the SSG `pokemons` prop so the
  // first cards — including the LCP hero image — are in the server HTML and paint
  // without waiting for hydration. Once seeded, defer to the filtered list.
  const listSource = ctxPokemons.length ? filteredPokemons : pokemons;

  const incrementNumberOfPokemonShown = () => setNumberOfPokemonShown(numberOfPokemonShown + POKEMON_STACK_SIZE);

  // The first row is the LCP candidate: render those heroes eagerly with high
  // fetch priority instead of lazy, so the browser doesn't deprioritize them.
  const renderPokemon = (pokemon: IBasicPokemon, index: number) => (
    <Pokemon key={pokemon.id} priority={index < ABOVE_THE_FOLD} {...pokemon} />
  );

  const renderPokemons = () => listSource.slice(0, numberOfPokemonShown).map(renderPokemon);

  const areThereMorePokemonsToShow = () => numberOfPokemonShown >= listSource.length;

  const updatePokemons = () => {
    if (pokemons) {
      setPokemons(pokemons);
      setLoading(false);
    }
  };

  useEffect(updatePokemons, [pokemons, setLoading, setPokemons]);

  useEffect(() => {
    filteredPokemons.slice(0, POKEMON_STACK_SIZE).forEach((pokemon) => {
      const url = resolution === LOW_RESOLUTION ? pokemon.pixelImageUrl : pokemon.hdImageUrl;
      ReactDOM.preload(url, { as: "image", fetchPriority: "high" });
    });
  }, [filteredPokemons, resolution]);

  if (!listSource.length && !loading) {
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
        {/* No loading gate here: the home page is SSG, so the cards (and the LCP
            hero image) are available immediately and must be server-rendered. */}
        <Page>
          <div className={styles.container}>
            <FlexboxList hasReachedEnd={areThereMorePokemonsToShow()} showMore={incrementNumberOfPokemonShown}>
              {renderPokemons()}
            </FlexboxList>
          </div>
        </Page>
      </ErrorScreenWrapper>
    </>
  );
};

export default memo(HomePage);

export async function getStaticProps() {
  const pokemons = await fetchAllPokemons();

  return { props: { pokemons } };
}

