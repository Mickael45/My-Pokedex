import {
  convertCmtoMeterString,
  cmToFeetString,
  joinValueWithUnit,
  kgToPoundsString,
} from "../../../utils/unitConverter";
import styles from "./PokemonBasicInfo.module.css";

interface IProps {
  color: string;
  height: number;
  weight: number;
  category: string;
  abilities: string[];
  description: string;
}

const BasicInfo = ({ color, height, weight, category, abilities, description }: IProps) => {
  const renderInfo = (title: string, info: string | string[]) => (
    <div>
      <div>{title}</div>
      <span id="info">{info}</span>
    </div>
  );

  const formattedAbilities = abilities.join("\n");
  const formattedHeight = `${convertCmtoMeterString(height)} (${cmToFeetString(height)})`;
  const formattedWeight = `${joinValueWithUnit(weight, "kg")} (${kgToPoundsString(weight)})`;

  return (
    <div className={styles.container}>
      {description}
      <div style={{ background: color }}>
        {renderInfo("Height", formattedHeight)}
        {renderInfo("Category", category)}
        {renderInfo("Weight", formattedWeight)}
        {renderInfo("Abilities", formattedAbilities)}
      </div>
    </div>
  );
};

export default BasicInfo;
