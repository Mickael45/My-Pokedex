import styles from "./ToggleSwitch.module.css";

interface IProps {
  handleClick: () => void;
  onLabel: string;
  offLabel: string;
  checked: boolean;
}

const ToggleSwitch = ({ handleClick, onLabel, offLabel, checked }: IProps) => (
  <div className={styles.container}>
    <input onChange={handleClick} className={styles.toggle} id="cb5" type="checkbox" checked={checked} />
    <label
      id="res switch"
      className={styles.toggleButton}
      data-tg-off={onLabel.toLocaleUpperCase()}
      data-tg-on={offLabel.toLocaleUpperCase()}
      htmlFor="cb5"
    ></label>
  </div>
);

export default ToggleSwitch;
