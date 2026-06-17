import { memo } from "react";
import { useRouter } from "next/router";
import { getPokemonPrimaryTypeColor } from "../../../utils/pokemonFormatter/pokemonFormatter";
import { usePokemonPic } from "../../../hooks/usePokemonPic";
import { usePokemonDetails } from "../../../hooks/usePokemonDetails";
import { DETAILS } from "../../../constants/Routes";
import StatBar from "./StatBar";
import TypeBadge from "./TypeBadge";

const Pokemon = ({ name, id, pixelImageUrl, hdImageUrl, types }: IBasicPokemon) => {
  const router = useRouter();
  const imageUrl = usePokemonPic(pixelImageUrl, hdImageUrl);
  const details = usePokemonDetails(id);

  const primaryType = types.split(",")[0];
  const cardColor = getPokemonPrimaryTypeColor(types);

  const stats = (details?.stats ?? []) as unknown as IPokemonStat[];
  const findStat = (label: string) =>
    stats.find((stat) => stat.label.toLowerCase() === label)?.value ?? null;

  const evolutionChain = details?.evolutionChain ?? [];
  const currentIndex = evolutionChain.findIndex((pokemon) => pokemon.id === id);
  const evolvesFrom = currentIndex > 0 ? evolutionChain[currentIndex - 1] : null;

  const handleClick = () => router.push(`${DETAILS}${id}`);

  return (
    <div
      className="p-2 bg-yellow-400 w-[17.5rem] rounded-xl transform hover:scale-105 transition-transform duration-300 font-sans cursor-pointer"
      onClick={handleClick}
    >
      <div className="rounded-md text-white" style={{ backgroundColor: cardColor }}>
        <div className="flex items-center gap-2 p-2">
          {/* Plain div (not <h2>) so the global high-res `h2 { font-size: 30px }`
              rule can't override the fixed size and cause a layout shift. */}
          <div className="flex-1 min-w-0 whitespace-nowrap text-[12px] font-bold capitalize leading-tight" title={name}>
            {name}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-[9px] font-bold">HP</span>
            <span className="text-[12px] font-bold leading-none">{findStat("hp") ?? "—"}</span>
            <TypeBadge type={primaryType} size={22} className="ml-2" />
          </div>
        </div>

        <div className="relative mx-2 mb-2 border-2 bg-gray-500 shadow-inner" style={{ borderColor: "silver" }}>
          <img src={imageUrl} alt={`${name}-pic`} className="w-full h-48 object-contain" loading="lazy" />
          {evolvesFrom && (
            <div className="absolute top-1.5 left-1.5 w-8 h-8 flex items-center justify-center bg-gray-100 border-2 border-white outline outline-2 outline-yellow-500 rounded-full overflow-hidden top-[-8] left-[-4]">
              <img
                src={evolvesFrom.pixelImageUrl}
                alt={evolvesFrom.name}
                className="w-10 h-10 object-contain"
                loading="lazy"
              />
            </div>
          )}
        </div>

        <div className="mx-2 p-2 pb-4">
          <div className="space-y-3">
            <StatBar label="Attack" value={findStat("attack")} />
            <StatBar label="Defense" value={findStat("defense")} />
            <StatBar label="Speed" value={findStat("speed")} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(Pokemon);
