import { JSX } from "react";
import styles from "./Page.module.css";

interface IProps {
  children: JSX.Element;
}

const Page = ({ children }: IProps) => <div className={styles.container}>{children}</div>;

export default Page;
