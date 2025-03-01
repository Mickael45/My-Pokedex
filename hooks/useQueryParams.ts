import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { TYPES, ID, NAME, EMPTY } from "../constants/QueryTypes";

type Query = { [ID]?: string; [TYPES]?: string; [NAME]?: string };

const queryTypes: QueryType[] = [TYPES, ID, NAME];
const EMPTY_QUERY_OBJ: QueryObj = { type: EMPTY, value: "" };

const getTypesFromQuery = (query: Query): QueryObj => {
  const types = query[TYPES];

  return types ? { type: TYPES, value: types } : EMPTY_QUERY_OBJ;
};

const getIdFromQuery = (query: Query): QueryObj => {
  const id = query[ID];

  return id ? { type: ID, value: id } : EMPTY_QUERY_OBJ;
};

const getNameFromQuery = (query: Query): QueryObj => {
  const name = query[NAME];

  return name ? { type: NAME, value: name } : EMPTY_QUERY_OBJ;
};

const queryTypeHashMap: { [key: string]: (query: Query) => QueryObj } = {
  [TYPES]: getTypesFromQuery,
  [ID]: getIdFromQuery,
  [NAME]: getNameFromQuery,
};

const useQueryParams = (): Array<QueryObj> => {
  const [queryTypeObjs, setQueryTypesObjs] = useState<QueryObj[]>([]);
  const query = useRouter().query;

  const getQueryDataByQueryType = (queryType: QueryType) => queryTypeHashMap[queryType](query);

  const updateQueryTypesObjs = () => {
    setQueryTypesObjs(queryTypes.map(getQueryDataByQueryType).filter((data) => data !== EMPTY_QUERY_OBJ));
  };

  useEffect(updateQueryTypesObjs, [query]);

  return queryTypeObjs;
};

export const usePokemonTypesFromQuery = (): string => (useRouter().query[TYPES] as PokemonType) || "";

export const usePokemonIdFromQuery = (): string => (useRouter().query[ID] as PokemonType) || "";

export const usePokemonNameFromQuery = (): string => (useRouter().query[NAME] as PokemonType) || "";

export default useQueryParams;
