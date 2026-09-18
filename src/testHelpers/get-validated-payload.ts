import { ValidatedPayload } from '../poco/standard-responses';

export function getValidatedPayload<T extends object>(payload: T): ValidatedPayload<T> {
  return {
    isInternalError: false,
    isSuccess: true,
    validationFailures: [],
    payload: JSON.parse(JSON.stringify(payload))
  };
}
