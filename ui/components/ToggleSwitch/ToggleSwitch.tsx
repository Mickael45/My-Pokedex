import { type ReactNode } from "react";
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
  <button
    type="button"
    className={styles.iconFlip}
    data-on={checked}
    onClick={handleClick}
    aria-label={checked ? offLabel : onLabel}
  >
    {checked ? icons.on : icons.off}
  </button>
);

export default ToggleSwitch;
