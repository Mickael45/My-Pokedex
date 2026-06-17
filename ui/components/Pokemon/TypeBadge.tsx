import { getTypeIconUrl } from "../../../utils/typeIcon";
import pokemonTypesColor from "../../../constants/TypesColor.json";

interface IProps {
  type: string;
  size?: number;
  className?: string;
}

/**
 * Official-card style type symbol: a type-coloured disc with the white type
 * glyph masked on top (built from local SVGs, so no image optimization runs).
 */
const TypeBadge = ({ type, size = 34, className = "" }: IProps) => {
  const color = (pokemonTypesColor as HashMap)[type] ?? "#888";
  const iconUrl = getTypeIconUrl(type);
  const glyphSize = Math.round(size * 0.58);

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 border-white outline outline-2 outline-yellow-500 ${className}`}
      style={{ width: size, height: size, backgroundColor: color }}
      title={type}
    >
      <span
        aria-label={type}
        role="img"
        style={{
          width: glyphSize,
          height: glyphSize,
          backgroundColor: "#fff",
          WebkitMaskImage: `url(${iconUrl})`,
          maskImage: `url(${iconUrl})`,
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
    </span>
  );
};

export default TypeBadge;
