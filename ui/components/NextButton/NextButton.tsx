interface IProps {
  limit: number;
  value: number;
  handleClick: (value: number) => void;
}

const NextButton = ({ limit, value, handleClick }: IProps) => {
  const createNextId = () => (value === limit ? 1 : value + 1);

  const handleNextButtonClick = () => handleClick(nextId);

  const nextId = createNextId();

  return <button id="id-nav-button" onClick={handleNextButtonClick}>{`#${nextId} >`}</button>;
};

export default NextButton;
