import { JSX, useContext } from "react";
import ErrorContext from "../../../../context/ErrorContext";
import { ErrorScreen } from "../../ErrorScreen/ErrorScreen";

interface IProps {
  children: JSX.Element;
}

export const ErrorScreenWrapper = ({ children }: IProps) => {
  const { error } = useContext(ErrorContext);

  return error ? <ErrorScreen type={error} /> : children;
};

export default ErrorScreenWrapper;
