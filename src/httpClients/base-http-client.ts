import { Effect } from 'effect';
import { defer, Observable, Subject, takeUntil } from 'rxjs';
import { PagedData, ValidatedForm, ValidatedPayload, ValidatedResponse } from '../poco/standard-responses';

export class BaseHttpClient {
  private readonly unsubscribeSubject = new Subject<void>();

  unsubscribe() {
    this.unsubscribeSubject.next();
    this.unsubscribeSubject.complete();
  }

  private register<T>(source: Observable<T>): Observable<T> {
    return source.pipe(takeUntil(this.unsubscribeSubject));
  }

  protected getOnePage<T extends object>(url: string): Observable<PagedData<T>> {
    return this.register(defer(async () => {
      const response = await fetch(url);
      const json = await response.json();
      return json as PagedData<T>;
    }));
  }

  protected requestValidatedResponse(url: string, httpVerb: 'GET' | 'POST' | 'PUT' | 'DELETE')
      : Observable<ValidatedResponse> {
    return this.register(defer(async () => {
      try {
        const response = await fetch(url, {
          method: httpVerb
        });
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
    }));
  }

  protected requestValidatedPayload<T extends object>(url: string, httpVerb: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET')
      : Observable<ValidatedPayload<T>> {
    return this.register(defer(async () => {
      try {
        const response = await fetch(url, {
          method: httpVerb
        });
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
    }));
  }

  protected submitForm<Tok extends object, Tfail extends object>(url: string, httpVerb: 'PUT' | 'POST', requestBody: object)
      : Observable<Effect.Effect<ValidatedPayload<Tok>, ValidatedForm<Tfail>, never>> {
    return this.register(defer(async () => {
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
        } as ValidatedForm<Tfail>) as Effect.Effect<ValidatedPayload<Tok>, ValidatedForm<Tfail>, never>;
      }
    }));
  }
}
