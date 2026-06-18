import { BaseSyntheticEvent } from "react";
import styles from "./Dropdown.module.css";

interface IProps {
  options: string[];
  label: string;
}

function Dropdown<U>({
  selectedOption,
  options,
  label,
  handleOptionSelectionChange,
}: IProps & { handleOptionSelectionChange: (option: U) => void; selectedOption: U }) {
  const renderOption = (option: string) => (
    <option key={option} value={option}>
      {option}
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
