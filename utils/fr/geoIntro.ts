// utils/fr/geoIntro.ts
// Pure builder for the FR detail GEO opener — the first, server-rendered
// sentence of a Pokémon page. It surfaces the English name in an "(anglais : …)"
// clause so AI answer engines and cross-language searchers can anchor the entity.
import { frGenerationOrdinal } from "../../constants/Generations";
import { capitalizeFirstLetter } from "../stringManipulation";

// frTypes are the already-localized French type LABELS (e.g. ["Plante","Poison"]).
export const geoIntroFr = ({
  frName,
  enName,
  frTypes,
  gen,
}: {
  frName: string;
  enName: string;
  frTypes: string[];
  gen: number;
}): string =>
  `${frName} (anglais : ${capitalizeFirstLetter(enName)}) est un Pokémon de type ${frTypes.join("/")} de la ${frGenerationOrdinal(
    gen,
  )} génération.`;
