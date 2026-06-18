import { memo } from "react";

import styles from "./TypeInteractions.module.css";
import Header from "../../ui/components/Header/Header";
import TypePicker from "../../ui/components/TypePicker/TypePicker";
import TypeMatchups from "../../ui/components/TypeMatchups/TypeMatchups";
import Page from "../../ui/templates/Page/Page";
import { allTypeSlugs, parseTypeSlug } from "../../utils/typeSlug";
import { breadcrumbJsonLd } from "../../utils/structuredData";
import { capitalizeFirstLetter } from "../../utils/stringManipulation";

interface IProps {
  combo: string;
  types: string[];
}

const ComboPage = ({ combo, types }: IProps) => {
  const label = types.map(capitalizeFirstLetter).join(" / ");
  const noun = types.length > 1 ? "Types" : "Type";

  return (
    <>
      <Header
        title={`${label} ${noun} — Weaknesses, Resistances & Best Matchups | Pokédex`}
        description={`Type effectiveness for ${label}: which types it is weak to, which it resists, and which it deals the most damage against.`}
        canonicalPath={`/type-interactions/${combo}`}
        jsonLd={breadcrumbJsonLd([
          { name: "Pokédex", path: "/" },
          { name: "Type Interactions", path: "/type-interactions" },
          { name: `${label} ${noun}`, path: `/type-interactions/${combo}` },
        ])}
      />
      <Page>
        <div className={styles.container}>
          <TypePicker selected={types} />
          <TypeMatchups selected={types} />
        </div>
      </Page>
    </>
  );
};

export default memo(ComboPage);

export async function getStaticPaths() {
  const paths = allTypeSlugs().map((combo) => ({ params: { combo } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { combo: string } }) {
  const types = parseTypeSlug(params.combo);
  if (!types.length) {
    return { notFound: true };
  }
  return { props: { combo: params.combo, types } };
}
