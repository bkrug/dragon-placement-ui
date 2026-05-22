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
