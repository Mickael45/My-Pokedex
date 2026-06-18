import { memo } from "react";

import styles from "./TypeInteractions.module.css";
import Header from "../../ui/components/Header/Header";
import TypePicker from "../../ui/components/TypePicker/TypePicker";
import TypeMatchups from "../../ui/components/TypeMatchups/TypeMatchups";
import TypeIntro from "../../ui/components/TypeMatchups/TypeIntro";
import Page from "../../ui/templates/Page/Page";
import { usePokemonTypesFromQuery } from "../../hooks/useQueryParams";
import { toTypeSlug } from "../../utils/typeSlug";
import { breadcrumbJsonLd } from "../../utils/structuredData";

const TypeInteractionsPage = () => {
  // Sort so a legacy ?types=water,fire URL renders the same label/order as the
  // canonical /type-interactions/fire-water page it points at.
  const selected = usePokemonTypesFromQuery().split(",").filter(Boolean).sort();
  const canonicalPath = selected.length ? `/type-interactions/${toTypeSlug(selected)}` : "/type-interactions";

  return (
    <>
      <Header
        title="Pokémon Type Interactions — Weakness & Strength Chart | Pokédex"
        description="Pick a type (or two) to see the damage it takes from and deals to every other type. Full Pokémon type effectiveness chart."
        canonicalPath={canonicalPath}
        jsonLd={breadcrumbJsonLd([
          { name: "Pokédex", path: "/" },
          { name: "Type Interactions", path: "/type-interactions" },
        ])}
      />
      <Page>
        <div className={styles.container}>
          <TypeIntro selected={selected} />
          <TypePicker selected={selected} />
          <TypeMatchups selected={selected} />
        </div>
      </Page>
    </>
  );
};

export default memo(TypeInteractionsPage);
