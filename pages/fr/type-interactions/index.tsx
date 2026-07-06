import { memo } from "react";

import styles from "../../type-interactions/TypeInteractions.module.css";
import Header from "../../../ui/components/Header/Header";
import TypePicker from "../../../ui/components/TypePicker/TypePicker";
import TypeMatchups from "../../../ui/components/TypeMatchups/TypeMatchups";
import TypeIntro from "../../../ui/components/TypeMatchups/TypeIntro";
import AdSlot from "../../../ui/components/AdSlot/AdSlot";
import Page from "../../../ui/templates/Page/Page";
import { usePokemonTypesFromQuery } from "../../../hooks/useQueryParams";
import { toFrTypeSlug } from "../../../utils/frTypeSlug";
import { toTypeSlug } from "../../../utils/typeSlug";
import { hreflangAlternates } from "../../../utils/hreflang";

const FrTypeInteractionsPage = () => {
  // Sort so a legacy ?types=water,fire URL renders the same label/order as the
  // canonical /fr/type-interactions/eau-feu page it points at. The query stays
  // English — the picker navigates to the FR combo pages.
  const selected = usePokemonTypesFromQuery().split(",").filter(Boolean).sort();
  const canonicalPath = selected.length
    ? `/fr/type-interactions/${toFrTypeSlug(selected)}`
    : "/fr/type-interactions";
  // Mirror the selected combo across locales; with nothing selected, pair the
  // bare index pages. `selected` is english, so the EN side is toTypeSlug.
  const enHref = selected.length ? `/type-interactions/${toTypeSlug(selected)}` : "/type-interactions";
  const frHref = canonicalPath;

  return (
    <>
      <Header
        title="Interactions de types Pokémon — Faiblesses & Résistances | Pokédex"
        description="Choisissez un type (ou deux) pour voir les dégâts qu'il subit et inflige à chaque autre type. Tableau complet d'efficacité des types Pokémon."
        canonicalPath={canonicalPath}
        alternates={hreflangAlternates(enHref, frHref)}
        ogLocale="fr_FR"
      />
      {/* Plan 6: hreflang/og:locale/breadcrumb */}
      <Page>
        <div className={styles.container}>
          <TypeIntro selected={selected} />
          <AdSlot name="typeChartBelowIntro" />
          <TypePicker selected={selected} />
          <TypeMatchups selected={selected} />
        </div>
      </Page>
    </>
  );
};

export default memo(FrTypeInteractionsPage);
