interface PokemonStat {
  name: string;
  value: number;
}
interface IBasicPokemon {
  id: number;
  name: string;
  imageUrl: string;
  types: string;
}

type IFullPokemon = IBasicPokemon & {
  stats: Stat[];
};
