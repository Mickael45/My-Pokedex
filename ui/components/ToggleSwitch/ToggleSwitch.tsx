import styles from "./ToggleSwitch.module.css";

interface IProps {
  handleClick: () => void;
  onLabel: string;
  offLabel: string;
  checked: boolean;
}

const ToggleSwitch = ({ handleClick, onLabel, offLabel, checked }: IProps) => (
  <div className={styles.container}>
    <input onChange={handleClick} className={styles.toggle} id={onLabel} type="checkbox" checked={checked} />
    <label
      id="res switch"
      className={styles.toggleButton}
      data-tg-off={onLabel.toLocaleUpperCase()}
      data-tg-on={offLabel.toLocaleUpperCase()}
      htmlFor={onLabel}
    ></label>
  </div>
);

export default ToggleSwitch;
