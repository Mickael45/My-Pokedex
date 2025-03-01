interface IProps {
  limit: number;
  value: number;
  handleClick: (value: number) => void;
}

const PreviousButton = ({ limit, value, handleClick }: IProps) => {
  const createPreviousId = () => (value - 1 === 0 ? limit : value - 1);

  const handlePreviousButtonClick = () => handleClick(previousId);

  const previousId = createPreviousId();

  return <button id="id-nav-button" onClick={handlePreviousButtonClick}>{`< #${previousId}`}</button>;
};

export default PreviousButton;
