import {
  formatToBasicPokemon,
  formatToFullPokemon,
  formatPokemonEvolutionChain,
} from "../../utils/pokemonFormatter/pokemonFormatter";
import {
  extractPokemonName,
  extractPokemonData,
} from "../../utils/pokemonFormatter/extractors";
import { Specie, IPokemonResponseType } from "../../utils/pokemonFormatter/types";
import { MAX_POKEMON_ID_ALLOWED, POKE_API_URL } from "../../constants/FetchPokemons";

const REQUEST_RETRIES = 3;
const REQUEST_RETRY_DELAY_MS = 400;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// fetchAllPokemons fans out ~1025 concurrent requests; a single reset connection
// would otherwise reject the whole Promise.all and crash getStaticProps. Retry
// transient failures (network errors and non-2xx responses) with a small backoff.
const request = async (url: string, attempt = 1): Promise<any> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request to ${url} failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (attempt >= REQUEST_RETRIES) {
      throw error;
    }

    await wait(REQUEST_RETRY_DELAY_MS * attempt);

    return request(url, attempt + 1);
  }
};

const fetchPokemonByNameOrId = async (name: string) => await request(`${POKE_API_URL}pokemon/${name}`)

const fetchPokemonEvolutionChain = async (pokemonSpeciesData: Specie) => {
  const pokemonEvolutionData = await request(pokemonSpeciesData.evolution_chain.url);
  const pokemonEvolutionChain = formatPokemonEvolutionChain(pokemonEvolutionData.chain);


  if (pokemonEvolutionChain.length <= 1) {
    return [];
  }
  const pokemonEvolutionChainSpeciesPromises = pokemonEvolutionChain.map(request)
  const evolutionChainPokemonsSpicies = await Promise.all<Specie>(pokemonEvolutionChainSpeciesPromises);
  const pokemonTrueNames = evolutionChainPokemonsSpicies.map(pokemonSpecie => pokemonSpecie.varieties.find(variety => variety.is_default)?.pokemon.name).filter(name => name !== undefined)

  const evolutionChainPokemonsDataPromises = pokemonTrueNames.map(fetchPokemonByNameOrId);
  const evolutionChainPokemonsData = await Promise.all<IPokemonResponseType>(evolutionChainPokemonsDataPromises);
  const formattedEvolutionChainPokemons = evolutionChainPokemonsData.map(formatToBasicPokemon);

  return formattedEvolutionChainPokemons;
};

export const fetchPokemonDetailsByNameOrId = async (id: string) => {
  const pokemonData = await fetchPokemonByNameOrId(id);
  const pokemonSpeciesData = await request(`${POKE_API_URL}pokemon-species/${id}`);
  const evolutionChainPokemons = await fetchPokemonEvolutionChain(pokemonSpeciesData);
  const formattedPokemon = formatToFullPokemon(pokemonData, evolutionChainPokemons, pokemonSpeciesData);

  return formattedPokemon;
};

export const fetchAllPokemons = async (): Promise<IBasicPokemon[]> => {
  const pokemonsData = await request(`${POKE_API_URL}pokemon?limit=${MAX_POKEMON_ID_ALLOWED}`);
  const pokemonsName = pokemonsData.results.map(extractPokemonName);
  const pokemonData = await Promise.all<IPokemonResponseType>(pokemonsName.map(fetchPokemonByNameOrId));
  const formattedPokemons = pokemonData.map(formatToBasicPokemon);
  
  return formattedPokemons;
};

export const fetchPokemonsByType = async (type: string): Promise<IBasicPokemon[]> => {
  const pokemonsData = await request(`${POKE_API_URL}type/${type}`);
  const pokemonsName = pokemonsData.pokemon.map(extractPokemonData).map(extractPokemonName);
  const pokemonData = await Promise.all<IPokemonResponseType>(pokemonsName.map(fetchPokemonByNameOrId));
  const formattedPokemons = pokemonData.map(formatToBasicPokemon);

  return formattedPokemons;
};
