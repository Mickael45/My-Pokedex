import { JSX } from "react";
import IntersectionObserver from "../../components/IntersectionObserver/IntersectionObserver";
import styles from "./FlexboxList.module.css";

interface IProps {
  children: JSX.Element[];
  showMore: () => void;
  hasReachedEnd: boolean;
}

const FlexboxList = ({ children, showMore, hasReachedEnd }: IProps) => {
  // Invisible spacer used purely as the infinite-scroll sentinel — it keeps a
  // height so the IntersectionObserver still fires, but shows no spinner.
  const renderLoadMoreComponent = () => (!hasReachedEnd ? <div className={styles.sentinel} /> : <div />);

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
