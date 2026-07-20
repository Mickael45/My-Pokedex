import * as FilteringTypes from "../../../constants/Types";
import { usePokemonTypesFromQuery } from "../../../hooks/useQueryParams";
import PokemonType from "../PokemonType/PokemonType";
import { useRouter } from "next/router";
import styles from "./TypesSelector.module.css";
import { HOME } from "../../../constants/Routes";

interface IProps {
  pathname?: string;
}

const filteringOptions = Object.values(FilteringTypes);

const TypesSelector = ({ pathname = HOME }: IProps) => {
  const router = useRouter();
  const filteringQuery = usePokemonTypesFromQuery();

  const selectedTypes = filteringQuery === "" ? [] : filteringQuery.split(",");
  const isSelected = (type: PokemonType) => selectedTypes.includes(type);

  // Toggle the type in/out of the query, then mirror it into `?types=`.
  const handleTypeClick = (type: PokemonType) => {
    const nextTypes = isSelected(type)
      ? selectedTypes.filter((current) => current !== type)
      : [...selectedTypes, type];
    const search = nextTypes.length === 0 ? "" : `types=${nextTypes.join(",")}`;

    router.push({ pathname, search });
  };

  return (
    <div className={styles.container}>
      <div>
        {filteringOptions.map((type) => (
          <PokemonType
            key={type}
            type={type}
            variant="filter"
            selected={isSelected(type)}
            handleTypeClick={handleTypeClick}
          />
        ))}
      </div>
    </div>
  );
};

export default TypesSelector;
