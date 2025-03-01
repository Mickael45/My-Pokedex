import { SOMETHING_WRONG_HAPPENED } from "../constants/Errors";
import { ErrorScreen } from "../ui/components/ErrorScreen/ErrorScreen";

const Custom500 = () => <ErrorScreen type={SOMETHING_WRONG_HAPPENED} />;

export default Custom500;
