import PagedData from '../poco/pagedData';
import { ValidatedResponse } from '../poco/validatedResponse';

export class HttpHelpers {
  static async getOnePage<T extends object>(url: string) {
    const response = await fetch(url);
    const json = await response.json();
    let source = json as PagedData<T>;
    return {
      offset: source.offset,
      limit: source.limit,
      totalRecords: source.totalRecords,
      data: source.data
    };
  };

  static async getValidatedResponse(url: string, init: RequestInit) {
    try {
      const response = await fetch(url, init);
      const json = await response.json();
      const validatedResponse = json as ValidatedResponse;
      return validatedResponse;
    }
    catch (ex) {
      return {
        isSuccess: false,
        isInternalError: true,
        validationFailures: [JSON.stringify(ex)]
      } as ValidatedResponse;
    }
  };
}
