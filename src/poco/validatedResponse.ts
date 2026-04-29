export class ValidatedResponse {
  isInternalError: boolean = false;
  isSuccess: boolean = false;
  validationFailures: string[] = [];
}