import { useContext, useEffect } from "react";
import Image from "next/image";

import styles from "./Details.module.css";
import { TYPE_INTERACTIONS } from "../../constants/Routes";
import LoadingContext from "../../context/LoadingContext";
import { usePokemonPic } from "../../hooks/usePokemonPic";
import { fetchAllPokemons, fetchPokemonDetailsByNameOrId } from "../../services/fetchPokemons/fetchPokemons";
import EvolutionChain from "../../ui/components/EvolutionChain/EvolutionChain";
import Header from "../../ui/components/Header/Header";
import IdNavigation from "../../ui/components/IdNavigation/IdNavigation";
import BasicInfo from "../../ui/components/PokemonBasicInfo/PokemonBasicInfo";
import PokemonTypes from "../../ui/components/PokemonTypes/PokemonTypes";
import PokemonWeaknesses from "../../ui/components/PokemonWeaknesses/PokemonWeaknesses";
import Radar from "../../ui/components/Radar/Radar";
import ErrorScreenWrapper from "../../ui/components/Wrappers/ErrorScreenWrapper/ErrorScreenWrapper";
import LoadingScreenWrapper from "../../ui/components/Wrappers/LoadingScreenWrapper/LoadingScreenWrapper";
import Page from "../../ui/templates/Page/Page";
import { getPokemonPrimaryTypeColor } from "../../utils/pokemonFormatter/pokemonFormatter";
import { capitalizeFirstLetter } from "../../utils/stringManipulation";

const DetailsPage = ({
  id,
  hdImageUrl,
  pixelImageUrl,
  name,
  stats,
  height,
  weight,
  types,
  weaknesses,
  evolutionChain,
  abilities,
  description,
  category,
}: IFullPokemon) => {
  const imageUrl = usePokemonPic(pixelImageUrl, hdImageUrl);
  const { setLoading } = useContext(LoadingContext);
  const color = getPokemonPrimaryTypeColor(types);
  const basicInfo = { description, height, weight, category, types, abilities, color };

  const setLoadingToFalse = () => setLoading(false);

  useEffect(setLoadingToFalse, [id, setLoading]);

  return (
    <>
      <Header
        title={`${capitalizeFirstLetter(name)}  Information`}
        description={"{`Find out about ${name}'s stats, types, weaknesses and much more !`}"}
      />
      <ErrorScreenWrapper>
        <LoadingScreenWrapper>
          <Page>
            <div>
              <IdNavigation id={id.toString()} />
              <div className={styles.container}>
                <div>
                  <h2>{capitalizeFirstLetter(name)}</h2>
                  <h3 id="id-details">{`#${id}`}</h3>
                </div>
                <div>
                  <Image
                    src={imageUrl}
                    alt={`${name}-pic`}
                    placeholder="blur"
                    blurDataURL={imageUrl}
                    height={400}
                    width={400}
                    style={{
                      maxWidth: "100%",
                      height: "auto"
                    }} />
                  <BasicInfo {...basicInfo} />
                  <div>
                    <Radar title="Stats" axisDataList={stats} color={color} />
                  </div>
                  <div>
                    <h3>Types</h3>
                    <PokemonTypes id={id} types={types} />
                    <h3>Weaknesses</h3>
                    <PokemonWeaknesses id={id.toString()} types={weaknesses} />
                    <div>
                      To learn more about type interactions, click <a href={TYPE_INTERACTIONS}>here</a>:
                    </div>
                  </div>
                  <EvolutionChain chain={evolutionChain} />
                </div>
              </div>
            </div>
          </Page>
        </LoadingScreenWrapper>
      </ErrorScreenWrapper>
    </>
  );
};

export default DetailsPage;

export async function getStaticPaths() {
  const pokemonsData = await fetchAllPokemons();
  const paths = pokemonsData.map((pokemon: IBasicPokemon) => ({ params: { id: pokemon.id.toString() } }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { id: string }}) {
  const pokemonData = await fetchPokemonDetailsByNameOrId(params.id);

  return { props: { ...pokemonData } };
}
