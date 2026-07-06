import { BaseSyntheticEvent } from "react";
import styles from "./Dropdown.module.css";

interface IProps {
  options: string[];
  label: string;
  // Optional display mapping: the option value (used for logic) stays the key,
  // while the visible text can be localized. Defaults to the value itself, so
  // callers that omit it render exactly as before.
  renderLabel?: (option: string) => string;
}

function Dropdown<U>({
  selectedOption,
  options,
  label,
  renderLabel,
  handleOptionSelectionChange,
}: IProps & { handleOptionSelectionChange: (option: U) => void; selectedOption: U }) {
  const renderOption = (option: string) => (
    <option key={option} value={option}>
      {renderLabel ? renderLabel(option) : option}
    </option>
  );

  const renderOptions = () => options.map(renderOption);

  const handleOnChange = (e: BaseSyntheticEvent) => handleOptionSelectionChange(e.target.value as U);

  return (
    <select
      className={styles.select}
      aria-label={label}
      value={selectedOption as unknown as string}
      onChange={handleOnChange}
    >
      {renderOptions()}
    </select>
  );
}

export default Dropdown;
