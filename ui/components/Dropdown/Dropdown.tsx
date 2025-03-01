import { BaseSyntheticEvent } from "react";

interface IProps {
  options: string[];
}

function Dropdown<U>({
  selectedOption,
  options,
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
    <select value={selectedOption as unknown as string} onChange={handleOnChange}>
      {renderOptions()}
    </select>
  );
}

export default Dropdown;
