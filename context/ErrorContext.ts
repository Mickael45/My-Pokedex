import { createContext } from "react";

interface IContextProps {
  error: ErrorType | null;
  setError: (errorType: ErrorType) => void;
}

export default createContext<IContextProps>({
  error: null,
  setError: () => {},
});
