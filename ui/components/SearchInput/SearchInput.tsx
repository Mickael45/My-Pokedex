import { FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import { getElementById } from "../../../utils/domManipulation";
import useFiltering from "../../../hooks/useFiltering";
import { usePokemonIdFromQuery, usePokemonNameFromQuery } from "../../../hooks/useQueryParams";
import styles from "./SearchInput.module.css";
import { DETAILS, HOME } from "../../../constants/Routes";

const NAME_INPUT_ID = "nameInputId";

const SearchInput = () => {
  const id = usePokemonIdFromQuery();
  const name = usePokemonNameFromQuery();
  const filteredPokemons = useFiltering();
  const router = useRouter();

  const isOnDetailsPage = router.pathname.startsWith(DETAILS);

  const handlePokemonsAndFilteringQueryChange = () => {
    const input = getElementById(NAME_INPUT_ID) as HTMLInputElement;

    input.value = isOnDetailsPage ? "" : id || name;
  };

  useEffect(handlePokemonsAndFilteringQueryChange, [id, name, filteredPokemons, isOnDetailsPage]);

  const createQuery = () => {
    const { value = "" } = getElementById(NAME_INPUT_ID) as HTMLInputElement;

    if (value === "") {
      router.push(HOME);
      return;
    }
    const search = !isNaN(+value) ? `id=${value.toLowerCase()}` : `name=${value.toLowerCase()}`;

    router.push({
      pathname: HOME,
      search,
    });
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createQuery();
  };

  return (
    <form onSubmit={handleFormSubmit} className={styles.container}>
      <div>
        <input autoComplete="off" placeholder="Search a Pokemon by name or id" id={NAME_INPUT_ID} />
        <img
          src="/icons/search.svg"
          onClick={createQuery}
          alt="searchIcon"
          height={25}
          width={25}
          style={{
            maxWidth: "100%",
            height: "auto"
          }} />
        <button type="submit" hidden>Submit</button>
      </div>
    </form>
  );
};

export default SearchInput;
