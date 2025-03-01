import { PAGE_NOT_FOUND, SOMETHING_WRONG_HAPPENED } from "./Errors";
import { PAGE_NOT_FOUND_MESSAGE, SOMETHING_WRONG_HAPPENED_MESSAGE } from "./ErrorMessages";

type ErrorTypeToMessageHashMapType = {
  [key in ErrorType]: ErrorMessage;
};

export const ErrorTypeToMessageHashMap: ErrorTypeToMessageHashMapType = {
  [PAGE_NOT_FOUND]: PAGE_NOT_FOUND_MESSAGE,
  [SOMETHING_WRONG_HAPPENED]: SOMETHING_WRONG_HAPPENED_MESSAGE,
};
