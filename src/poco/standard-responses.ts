export interface ValidatedResponse {
  isInternalError: boolean;
  isSuccess: boolean;
  validationFailures: string[];
}

export interface ValidatedPayload<T extends object> extends ValidatedResponse {
  payload: T;
}

export interface PagedData<T extends object>
{
    offset: number;
    limit: number;
    totalRecords: number;
    data: T[];
}