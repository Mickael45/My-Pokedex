import { useEffect } from "react";
import * as FilteringTypes from "../../../constants/Types";
import { usePokemonTypesFromQuery } from "../../../hooks/useQueryParams";
import PokemonType from "../PokemonType/PokemonType";
import { useRouter } from "next/router";
import {
  addCheckedDatasetToElement,
  addClassToElement,
  doesElementContainClass,
  getElementByQuerySelector,
  removeCheckedDatasetFromElement,
  removeClassFromElement,
} from "../../../utils/domManipulation";
import styles from "./TypesSelector.module.css";
import useFiltering from "../../../hooks/useFiltering";
import { HOME } from "../../../constants/Routes";

interface IProps {
  pathname?: string;
}

const filteringOptions = Object.values(FilteringTypes);

const TypesSelector = ({ pathname = HOME }: IProps) => {
  const router = useRouter();
  const filteringQuery = usePokemonTypesFromQuery();
  const filteredPokemons = useFiltering();

  const doesFilteringQueryIncludeType = (type: PokemonType) => filteringQuery.split(",").includes(type);

  const setElementAsChecked = (element: HTMLSpanElement) => {
    addClassToElement(element, styles.highlight);
    addCheckedDatasetToElement(element);
  };

  const setElementAsUnchecked = (element: HTMLSpanElement) => {
    removeClassFromElement(element, styles.highlight);
    removeCheckedDatasetFromElement(element);
  };

  const applyStyle = (element: HTMLSpanElement) =>
    doesFilteringQueryIncludeType(element.dataset.type as PokemonType)
      ? setElementAsChecked(element)
      : setElementAsUnchecked(element);

  const applySelectedStyleToSelectedTypes = () => {
    const getTypeElement = (type: PokemonType) => getElementByQuerySelector(`[data-type=${type}]`) as HTMLSpanElement;
    const typeElements = filteringOptions.map(getTypeElement);

    if (!typeElements) {
      return;
    }
    typeElements.forEach(applyStyle);
  };

  useEffect(applySelectedStyleToSelectedTypes, [filteringQuery, filteredPokemons]);

  const removeTypeFromQuery = (type: PokemonType | string) => {
    const doesFilterTypeMatchWithType = (filterType: PokemonType | string) => filterType === type;

    const currentQueryTypes = filteringQuery.split(",");
    const typeIndex = currentQueryTypes.findIndex(doesFilterTypeMatchWithType);

    currentQueryTypes.splice(typeIndex, 1);

    return currentQueryTypes.join(",");
  };

  const addTypeToQuery = (type: PokemonType | string) => {
    const currentQueryTypes = filteringQuery === "" ? [] : filteringQuery.split(",");

    currentQueryTypes.push(type);

    return currentQueryTypes.join(",");
  };

  const createQuery = (type: string, element: HTMLElement) => {
    const types = doesElementContainClass(element, styles.highlight) ? removeTypeFromQuery(type) : addTypeToQuery(type);
    const search = types === "" ? "" : `types=${types}`;

    router.push({
      pathname,
      search,
    });
  };

  const handleTypeClick = (type: PokemonType) => {
    const typeElement = getElementByQuerySelector(`[data-type=${type}]`);
    console.log("Click handled");
    return typeElement ? createQuery(type, typeElement) : null;
  };

  const renderPokemonType = (type: PokemonType) => (
    <PokemonType key={type} type={type} handleTypeClick={handleTypeClick} />
  );

  const renderPokemonTypes = () => filteringOptions.map(renderPokemonType);

  return (
    <div className={styles.container}>
      <div>{renderPokemonTypes()}</div>
    </div>
  );
};

export default TypesSelector;
