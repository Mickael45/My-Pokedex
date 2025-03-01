import Link from "next/link";
import { TYPE_INTERACTIONS } from "../../../constants/Routes";
import styles from "./BanneredButton.module.css";

interface IProps {
  children: string;
}

const BanneredButton = ({ children }: IProps) => (
  <Link
    href={TYPE_INTERACTIONS}
    id="bannered-button"
    className={styles.container}>

    {children}

  </Link>
);

export default BanneredButton;
