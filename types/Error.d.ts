import { PAGE_NOT_FOUND, SOMETHING_WRONG_HAPPENED } from "../constants/Errors";
import { PAGE_NOT_FOUND_MESSAGE, SOMETHING_WRONG_HAPPENED_MESSAGE } from "../constants/ErrorMessages";

declare global {
  export type ErrorType = typeof PAGE_NOT_FOUND | typeof SOMETHING_WRONG_HAPPENED;
  export type ErrorMessage = typeof PAGE_NOT_FOUND_MESSAGE | typeof SOMETHING_WRONG_HAPPENED_MESSAGE;
}
