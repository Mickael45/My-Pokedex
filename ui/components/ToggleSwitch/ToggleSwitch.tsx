import { type ReactNode } from "react";
import { capitalizeFirstLetter } from "../../../utils/stringManipulation";
import styles from "./ToggleSwitch.module.css";

interface IProps {
  handleClick: () => void;
  onLabel: string;
  offLabel: string;
  checked: boolean;
  /** `off` icon is shown while unchecked, `on` while checked. */
  icons: { on: ReactNode; off: ReactNode };
}

const ToggleSwitch = ({ handleClick, onLabel, offLabel, checked, icons }: IProps) => (
  <div className={styles.container}>
    <button
      type="button"
      className={styles.iconFlip}
      data-on={checked}
      onClick={handleClick}
      aria-label={checked ? offLabel : onLabel}
    >
      {checked ? icons.on : icons.off}
    </button>
    <span className={styles.iconFlipCap}>{capitalizeFirstLetter(checked ? offLabel : onLabel)}</span>
  </div>
);

export default ToggleSwitch;
