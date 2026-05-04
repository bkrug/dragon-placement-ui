export interface ValidatedResponse {
  isInternalError: boolean;
  isSuccess: boolean;
  validationFailures: string[];
}

export interface ValidatedPayload<T extends object> {
  isInternalError: boolean;
  isSuccess: boolean;
  validationFailures: string[];
  payload: T;
}