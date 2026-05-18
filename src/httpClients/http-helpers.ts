import { Effect } from 'effect';
import { PagedData, ValidatedForm, ValidatedPayload, ValidatedResponse } from '../poco/standard-responses';

export class HttpHelpers {
  static async getOnePage<T extends object>(url: string, init?: RequestInit) {
    const response = await fetch(url, init);
    const json = await response.json();
    const source = json as PagedData<T>;
    return source;
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

  static async submitForm<Tok extends object, Tfail extends object>(url: string, httpVerb: string, requestBody: object) {
    try {
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      const response = await fetch(url, {
        method: httpVerb,
        headers: headers,
        body: JSON.stringify(requestBody)
      });
      const json = await response.json();
      const result = response.ok
        ? Effect.succeed(json as ValidatedPayload<Tok>)
        : Effect.fail(json as ValidatedForm<Tfail>);
      return result as Effect.Effect<ValidatedPayload<Tok>, ValidatedForm<Tfail>, never>;
    }
    catch (ex) {
      console.error(JSON.stringify(ex));
      return Effect.fail({
        isSuccess: false,
        isInternalError: true
      } as ValidatedForm<Tfail>)
    }
  }
}
