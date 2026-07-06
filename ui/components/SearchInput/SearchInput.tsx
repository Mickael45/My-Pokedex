import { FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import { getElementById } from "../../../utils/domManipulation";
import useFiltering from "../../../hooks/useFiltering";
import { usePokemonIdFromQuery, usePokemonNameFromQuery } from "../../../hooks/useQueryParams";
import styles from "./SearchInput.module.css";
import { DETAILS, HOME, FR_HOME, FR_POKEMON } from "../../../constants/Routes";
import { useLocale, useStrings } from "../../../hooks/useLocale";

const NAME_INPUT_ID = "nameInputId";

const SearchInput = () => {
  const id = usePokemonIdFromQuery();
  const name = usePokemonNameFromQuery();
  const filteredPokemons = useFiltering();
  const router = useRouter();
  const locale = useLocale();
  const strings = useStrings();

  // The FR detail route (/fr/pokemon/[slug]) is a details page too, so the
  // input is cleared there just as on the English /details/ route.
  const isOnDetailsPage =
    router.pathname.startsWith(DETAILS) || router.pathname.startsWith(FR_POKEMON);
  const homeHref = locale === "fr" ? FR_HOME : HOME;

  const handlePokemonsAndFilteringQueryChange = () => {
    const input = getElementById(NAME_INPUT_ID) as HTMLInputElement;

    input.value = isOnDetailsPage ? "" : id || name;
  };

  useEffect(handlePokemonsAndFilteringQueryChange, [id, name, filteredPokemons, isOnDetailsPage]);

  const createQuery = () => {
    const { value = "" } = getElementById(NAME_INPUT_ID) as HTMLInputElement;

    if (value === "") {
      router.push(homeHref);
      return;
    }
    const search = !isNaN(+value) ? `id=${value.toLowerCase()}` : `name=${value.toLowerCase()}`;

    router.push({
      pathname: homeHref,
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
        <input autoComplete="off" placeholder={strings.searchPlaceholder} id={NAME_INPUT_ID} />
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
        <button type="submit" hidden>{strings.searchSubmit}</button>
      </div>
    </form>
  );
};

export default SearchInput;
