import React, { memo } from "react";

import typeInteractionsData from "../../constants/TypeInteractions.json";
import styles from "./TypeInteractions.module.css";
import { TYPE_INTERACTIONS } from "../../constants/Routes";
import useQueryParams from "../../hooks/useQueryParams";
import EmptyListPlaceholder from "../../ui/components/EmptyListPlaceholder/EmptyListPlaceholder";
import Header from "../../ui/components/Header/Header";
import TypeInteractionTile from "../../ui/components/TypeInteractionTile/TypeInteractionTile";
import TypesSelector from "../../ui/components/TypesSelector/TypesSelector";
import Page from "../../ui/templates/Page/Page";
import { convertTypeInteractionArrayToObj } from "../../utils/pokemonTypes/convertors";
import { filterByMonoType, filterByMultiType } from "../../utils/pokemonTypes/filtering";


const TypeInteractionsPage = () => {
  const filters = useQueryParams().map(({ value }) => value);

  const pokemonInteractionTypes = typeInteractionsData.flat().map(Object.values).map(convertTypeInteractionArrayToObj);

  const renderTypeInteractionTable = (interactionType: InteractionType) => {
    const { type, typeInteractions } = interactionType;

    return <TypeInteractionTile key={type} type={type} typeInteractions={typeInteractions} />;
  };

  const isFilterIncludedInType = ({ type }: { type: PokemonType }) =>
    filters.length === 1 ? filterByMonoType(filters, type) : filterByMultiType(filters, type);

  const renderTypeInteractionTables = () => {
    if (filters.length === 0) {
      return <div className={styles.typeInteractions}>Select the type(s) you want to see weaknesses for.</div>;
    }
    const typeInteractions = pokemonInteractionTypes.filter(isFilterIncludedInType).map(renderTypeInteractionTable);

    return typeInteractions.length === 0 ? (
      <EmptyListPlaceholder text="No interactions found for this type combination..." />
    ) : (
      <div className={styles.typeInteractions}>{typeInteractions}</div>
    );
  };

  return (
    <>
      <Header
        title="Type Interactions"
        description="Learn more about which types pokemons are weak and resistant against !"
      />
      <Page>
        <div id="type-interactions" className={styles.container}>
          <TypesSelector pathname={TYPE_INTERACTIONS} />
          <div>{renderTypeInteractionTables()}</div>
        </div>
      </Page>
    </>
  );
};

export default memo(TypeInteractionsPage);
