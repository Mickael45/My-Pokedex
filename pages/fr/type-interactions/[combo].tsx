import { memo } from "react";

import styles from "../../type-interactions/TypeInteractions.module.css";
import Header from "../../../ui/components/Header/Header";
import TypePicker from "../../../ui/components/TypePicker/TypePicker";
import TypeMatchups from "../../../ui/components/TypeMatchups/TypeMatchups";
import TypeIntro from "../../../ui/components/TypeMatchups/TypeIntro";
import Page from "../../../ui/templates/Page/Page";
import { allFrTypeSlugs, parseFrTypeSlug } from "../../../utils/frTypeSlug";
import { FR_TYPE_LABELS } from "../../../constants/FrTypeLabels";
import { capitalizeFirstLetter } from "../../../utils/stringManipulation";

interface IProps {
  combo: string;
  types: string[];
}

const FrComboPage = ({ combo, types }: IProps) => {
  const label = types.map((t) => FR_TYPE_LABELS[t] ?? capitalizeFirstLetter(t)).join(" / ");

  return (
    <>
      <Header
        title={`${label} — Faiblesses, Résistances & Meilleurs Matchups | Pokédex`}
        description={`Efficacité des types pour ${label} : à quels types il est faible, lesquels il résiste, et contre lesquels il inflige le plus de dégâts.`}
        canonicalPath={`/fr/type-interactions/${combo}`}
      />
      {/* Plan 6: hreflang/og:locale/breadcrumb */}
      <Page>
        <div className={styles.container}>
          <TypeIntro selected={types} />
          <TypePicker selected={types} />
          <TypeMatchups selected={types} />
        </div>
      </Page>
    </>
  );
};

export default memo(FrComboPage);

export async function getStaticPaths() {
  const paths = allFrTypeSlugs().map((combo) => ({ params: { combo } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { combo: string } }) {
  const types = parseFrTypeSlug(params.combo);
  if (!types.length) {
    return { notFound: true };
  }
  return { props: { combo: params.combo, types } };
}
