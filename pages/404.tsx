import { PAGE_NOT_FOUND } from "../constants/Errors";
import { ErrorScreen } from "../ui/components/ErrorScreen/ErrorScreen";

const Custom404 = () => <ErrorScreen type={PAGE_NOT_FOUND} />;

export default Custom404;
