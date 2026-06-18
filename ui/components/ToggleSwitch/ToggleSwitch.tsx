import { type ReactNode } from "react";
import { capitalizeFirstLetter } from "../../../utils/stringManipulation";
import styles from "./ToggleSwitch.module.css";

interface IProps {
  handleClick: () => void;
  onLabel: string;
  offLabel: string;
  checked: boolean;
  /** When provided, mobile shows a round icon flip-button instead of the
   *  text pill: `off` is shown while unchecked, `on` while checked. */
  icons?: { on: ReactNode; off: ReactNode };
}

const ToggleSwitch = ({ handleClick, onLabel, offLabel, checked, icons }: IProps) => (
  <div className={styles.container}>
    {/* Desktop: sliding text pill. */}
    <input onChange={handleClick} className={styles.toggle} id={onLabel} type="checkbox" checked={checked} />
    <label
      id="res switch"
      className={styles.toggleButton}
      data-tg-off={onLabel.toLocaleUpperCase()}
      data-tg-on={offLabel.toLocaleUpperCase()}
      htmlFor={onLabel}
    ></label>

    {/* Mobile: round icon flip-button (only when icons are supplied). */}
    {icons && (
      <span className={styles.iconFlipWrap}>
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
      </span>
    )}
  </div>
);

export default ToggleSwitch;
