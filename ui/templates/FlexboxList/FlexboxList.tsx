import { JSX } from "react";
import IntersectionObserver from "../../components/IntersectionObserver/IntersectionObserver";
import PokeballSpinner from "../../components/PokeballSpinner/PokeballSpinner";
import styles from "./FlexboxList.module.css";

interface IProps {
  children: JSX.Element[];
  showMore: () => void;
  hasReachedEnd: boolean;
}

const FlexboxList = ({ children, showMore, hasReachedEnd }: IProps) => {
  const renderLoadMoreComponent = () => (!hasReachedEnd ? <PokeballSpinner /> : <div />);

  const renderIntersectionObserver = () =>
    children?.length > 0 ? (
      <IntersectionObserver handleIntersection={showMore}>{renderLoadMoreComponent()}</IntersectionObserver>
    ) : null;

  return (
    <>
      <div className={styles.flexbox}>{children}</div>
      {renderIntersectionObserver()}
    </>
  );
};

export default FlexboxList;
