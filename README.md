# Dragon Placement UI

This is a project to practice Angular developement. It is to be used by an imaginary company that matches job-hunting dragons with companies looking to employ dragons in contract work.

The companion C# code can be found at: https://github.com/bkrug/dragon-placement-api

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.8.

## Journal of changes

### 2026-05-21

Prior to commit eabe8f6a6fb5f62eb72c550d6aa819e8d156b86b, the various form fields were just raw HTML elements.
These were asserts when I tested the process of loading a form for editing.
Notice the "valueAsNumber" field.
```
    expect(getInputElement(nativeElement, '#job-title input').value).toEqual(initialDbRecord.jobTitle);
    expect(getInputElement(nativeElement, '#employer-name input').value).toEqual(initialDbRecord.employerName);
    expect(getInputElement(nativeElement, '#number-of-positions input').valueAsNumber).toEqual(initialDbRecord.numberOfPositions);
    expect(getInputElement(nativeElement, '#start-date input').value).toEqual(beginDateString);
    expect(getInputElement(nativeElement, '#end-date input').value).toEqual(endDateString);
```
But then I changed to start using the PrimeNg library for my forms.
The only reason to do this was consistency of appearance.
This changed my tests to look like this.
```
    expect(getInputElement(nativeElement, '#job-title input').value).toEqual(initialDbRecord.jobTitle);
    expect(getInputElement(nativeElement, '#employer-name input').value).toEqual(initialDbRecord.employerName);
    expect(getInputElement(nativeElement, '#number-of-positions input').value).toEqual(initialDbRecord.numberOfPositions.toString());
    expect(component.formGroup().get('startDate')?.value).toEqual(beginDate);
    expect(component.formGroup().get('endDate')?.value).toEqual(endDate);
```
PrimeNg forced me to change drop the "valueAsNumber" field.
We see a string comparison being done in this new version of the code; the alternative would have been to test that value coming from the FormGroup.
(This form is a Reactive Form.)

For date fields, I started getting the value from the FormGroup.
This allows me to use strict typing, on the "Date" type.
It also seemingly makes those two asserts less brittle; I don't need to worry about changing the library wrapped around field controls, or moving the field around in the form.
But I can't tell if that is actually an improvement or not.
Do I want to run asserts by reading from the DOM, and testings slightly more functionality?
Or do I want to test by interacting with the Angular component, and skipping some implementation details?
I don't know the answer.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


## Read this later:

ME:
Look at the mocking that we do of the httpClient in lines 42 to 53 of this file (manage-job.spec.ts).
If I someday switch to using observables with the httpResource() method, will the mocking get any more complicated or any simpler?

CLAUDE WORKING:

Read manage-job.spec.ts
Web SearchhttpResource Angular testing mock HttpTestingController unit test how does httpResource work internally HttpClient
OUT
Web search results for query: "httpResource Angular testing mock HttpTestingController unit test how does httpResource work internally HttpClient"

Links: [{"title":"Angular Mocking With HttpTestingController (Complete Guide)","url":"https://blog.angular-university.io/angular-http-testing-httptestingcontroller/"},{"title":"Reactive data fetching with httpResource • Angular","url":"https://angular.dev/guide/http/http-resource"},{"title":"Mocking httpResource in Angular","url":"https://mylifeandcode.blogspot.com/2026/01/mocking-httpresource-in-angular.html"},{"title":"HttpTestingController - Angular learning - GitBook","url":"https://baldur.gitbook.io/angular/angular-test/testing/angular-testing/httptestingcontroller"},{"title":"Angular Test case — HTTP request (GET) using HttpTestingController | by Piyali Das | Medium","url":"https://medium.com/@piyalidas.it/angular-unit-test-case-of-http-request-get-using-httptestingcontroller-e68004758eb6"},{"title":"Writing resilient Angular Component tests (that use HttpResource) with HttpTestingController","url":"https://timdeschryver.dev/blog/writing-resilient-angular-component-tests-that-use-httpresource-with-httptestingcontroller"},{"title":"mock api calls","url":"https://educative.io/courses/angular-testing-with-jasmine/mock-api-calls"},{"title":"www.oreilly.com","url":"https://www.oreilly.com/library/view/angularjs-web-application/9781783285617/ch04s10.html"},{"title":"Testing Streams Using the HTTPClient Module","url":"https://www.educative.io/courses/reactive-programming-with-angular-and-rxjs-7/lta/testing-streams-using-the-httpclient-module"}]

CLAUDE RESPONSE:

Based on the search results, here's what I found about Angular's HttpTestingController and httpResource:

## How HttpTestingController Works

HttpTestingController does not mock HttpClient; instead, it replaces the transport layer underneath it. It works by replacing the real HTTP backend with an in-memory "backend" that intercepts requests and lets you respond to them manually from within your test.

## Testing httpResource with HttpTestingController

A unit test for code using httpResource involves configuring TestBed with `provideHttpClientTesting()`, injecting HttpTestingController, then using methods like `expectOne()` to intercept requests and `flush()` to respond with data.

## Key Differences Between httpResource and HttpClient

httpResource differs from HttpClient as it initiates the request eagerly, whereas HttpClient only initiates requests upon subscription to the returned Observable.

## Using HttpTestingController for Tests

HttpTestingController methods like expectOne, match, and flush can be used to verify HTTP requests and simulate responses without contacting external APIs. The flush method completes the request using the data passed to it, and the verify method ensures there are no outstanding requests.


REMINDER: You MUST include the sources above in your response to the user using markdown hyperlinks.
More complicated, not simpler — and it's a fairly clean architectural trade-off. Here's why.

What makes the current mocking easy: AssignmentHttpClient is a plain Injectable whose methods just return Promises of plain data. In the spec, you do new AssignmentHttpClient() and overwrite individual methods (mockHttpClient.getOnePageOfCandidates = async (...) => {...}) with fake implementations, then swap the whole instance in via { provide: AssignmentHttpClient, useValue: mockHttpClient }. There's no network layer involved at all in the test — you're mocking at the level of "here's a class with methods," which is about as cheap as mocking gets.

What changes with httpResource(): it's built on top of HttpClient's backend, the same transport layer HttpTestingController replaces. So instead of stubbing a method, you'd have to:

Add provideHttpClientTesting() to the TestBed providers.
Inject HttpTestingController.
For every request the component fires, call httpMock.expectOne('/api/dragon?jobId=12&offset=0&limit=...') and .flush(mockData) — matching by literal URL/method, not by a friendly method name.
Call httpMock.verify() to make sure nothing was left unhandled.
That's more ceremony per test, and it's more brittle — your test now has to know the exact URL your component/resource builds (query params, order, etc.) instead of just knowing which named method got called.

There's also a structural loss: right now AssignmentHttpClient gives you one seam to swap for all of a component's HTTP calls at once. httpResource() calls are idiomatically declared as fields directly on the component (dragon = httpResource(() => ...)), so if you migrated fully, you'd likely lose that centralized service layer — each component's resource becomes its own thing to intercept individually in tests, rather than one mock object with a handful of overridden methods.

If you did want to keep today's low-friction mocking style, you could keep AssignmentHttpClient as-is (Promise-returning, fetch-based) and only wrap its results in resource() (not httpResource()) at the call site — resource() takes an arbitrary async loader, so it'd still go through your existing mockable service and wouldn't require HttpTestingController at all. That gets you the loading/error/cancellation benefits of the resource API without giving up your current test seam.

Sources:

Reactive data fetching with httpResource • Angular
Writing resilient Angular Component tests (that use HttpResource) with HttpTestingController