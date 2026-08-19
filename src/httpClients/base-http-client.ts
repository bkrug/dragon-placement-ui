import { Effect } from 'effect';
import { catchError, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
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
    return this.register(
      fromFetch(url)
      .pipe(
        switchMap(response => response.json() as Promise<PagedData<T>>)
      ));
  }

  protected requestValidatedResponse(url: string, httpVerb: 'GET' | 'POST' | 'PUT' | 'DELETE')
      : Observable<ValidatedResponse> {
    return this.register(
      fromFetch(url, { method: httpVerb })
      .pipe(
        switchMap(response => response.json() as Promise<ValidatedResponse>),
        catchError(ex => of({
          isSuccess: false,
          isInternalError: true,
          validationFailures: [JSON.stringify(ex)]
        } as ValidatedResponse))
      ));
  }

  protected requestValidatedPayload<T extends object>(url: string, httpVerb: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET')
      : Observable<ValidatedPayload<T>> {
    return this.register(
      fromFetch(url, { method: httpVerb })
      .pipe(
        switchMap(response => response.json() as Promise<ValidatedPayload<T>>),
        catchError(ex => of({
          isSuccess: false,
          isInternalError: true,
          validationFailures: [JSON.stringify(ex)]
        } as ValidatedPayload<T>))
      ));
  }

  protected submitForm<Tok extends object, Tfail extends object>(url: string, httpVerb: 'PUT' | 'POST', requestBody: object)
      : Observable<Effect.Effect<ValidatedPayload<Tok>, ValidatedForm<Tfail>, never>> {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    const requestInit = {
      method: httpVerb,
      headers: headers,
      body: JSON.stringify(requestBody)
    };
    return this.register(
      fromFetch(url, requestInit)
      .pipe(
        switchMap(async response => {
          const json = await response.json();
          return response.ok
            ? Effect.succeed(json as ValidatedPayload<Tok>)
            : Effect.fail(json as ValidatedForm<Tfail>);
        }),
        catchError(ex => {
          console.error(JSON.stringify(ex));
          return of(Effect.fail({
            isSuccess: false,
            isInternalError: true
          } as ValidatedForm<Tfail>) as Effect.Effect<ValidatedPayload<Tok>, ValidatedForm<Tfail>, never>);
        })
      ));
  }
}
