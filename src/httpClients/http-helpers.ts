import { ValidatedResponse, ValidatedPayload, PagedData } from '../poco/standard-responses';

export class HttpHelpers {
  static async getOnePage<T extends object>(url: string, init?: RequestInit) {
    const response = await fetch(url, init);
    const json = await response.json();
    let source = json as PagedData<T>;
    return {
      offset: source.offset,
      limit: source.limit,
      totalRecords: source.totalRecords,
      data: source.data
    };
  };

  static async getValidatedResponse(url: string, init?: RequestInit) {
    try {
      const response = await fetch(url, init);
      const json = await response.json();
      return json as ValidatedResponse;
    }
    catch (ex) {
      return {
        isSuccess: false,
        isInternalError: true,
        validationFailures: [JSON.stringify(ex)]
      } as ValidatedResponse;
    }
  };

  static async getValidatedPayload<T extends object>(url: string, init?: RequestInit) {
    try {
      const response = await fetch(url, init);
      const json = await response.json();
      return json as ValidatedPayload<T>;
    }
    catch (ex) {
      return {
        isSuccess: false,
        isInternalError: true,
        validationFailures: [JSON.stringify(ex)]
      } as ValidatedPayload<T>;
    }    
  }
}
