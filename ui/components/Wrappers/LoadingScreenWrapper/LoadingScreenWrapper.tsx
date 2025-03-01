import { JSX, useContext } from "react";
import LoadingContext from "../../../../context/LoadingContext";
import PikachuLoader from "../../PikachuLoader/PikachuLoader";

interface IProps {
  children: JSX.Element;
}

const LoadingScreenWrapper = ({ children }: IProps) => {
  const { loading } = useContext(LoadingContext);

  return loading ? <PikachuLoader /> : children;
};

export default LoadingScreenWrapper;
