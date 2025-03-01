import { createContext } from "react";

interface IContextProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export default createContext<IContextProps>({
  loading: false,
  setLoading: () => {},
});
