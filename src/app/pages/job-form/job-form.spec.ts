import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Effect } from 'effect';
import { of } from 'rxjs';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { JobCreateEdit } from '../../../poco/endpoint-request-bodies';
import { Job, SkillTag } from '../../../poco/models';
import { PagedData, ValidatedForm, ValidatedPayload } from '../../../poco/standard-responses';
import { ValidationFailures } from '../../../poco/validation-failures';
import { MockActivatedRoute } from '../../../testHelpers/MockActivatedRoute';
import { JobForm } from './job-form';

describe('Job Form Tests', () => {
  function getInputElement(nativeElement: HTMLDivElement, css: string) {
    return nativeElement.querySelector(css) as HTMLInputElement;
  }

  const beginDateString = '2010-01-01';
  const endDateString = '2010-12-31';

  it('Load a blank Job Form for creation of a job', async () => {
    const mockHttpClient = new AssignmentHttpClient();
    let getMethodWasCalled = false;
    mockHttpClient.getJob = () => {
      getMethodWasCalled = true;
      return of({
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: new Job()
      } as ValidatedPayload<Job>);
    };

    let actualModelInPostRequest = new JobCreateEdit();
    mockHttpClient.postJobForm = (job: JobCreateEdit) => {
      actualModelInPostRequest = job;
      const validatedPayload = {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: JSON.parse(JSON.stringify(job))
      } as ValidatedPayload<Job>;
      return of(Effect.succeed(validatedPayload) as Effect.Effect<ValidatedPayload<Job>, ValidatedForm<ValidationFailures>, never>);
    };

    mockHttpClient.getAllSkills = () => {
      return of({
        offset: 0,
        limit: 20,
        totalRecords: 0,
        data: []
      } as PagedData<SkillTag>);
    };

    const mockActivatedRoute = new MockActivatedRoute();
    mockActivatedRoute.setParams({});
    TestBed.configureTestingModule({
      providers: [
        { provide: AssignmentHttpClient, useValue: mockHttpClient },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    //Act
    await TestBed.configureTestingModule({ imports: [JobForm] }).compileComponents();
    const fixture = TestBed.createComponent(JobForm);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    //Assert: fields should be empty
    expect(component).toBeTruthy();
    expect(getMethodWasCalled).toEqual(false);
    const nativeElement: HTMLDivElement = fixture.nativeElement;
    expect(getInputElement(nativeElement, '#job-title input').value).toBeFalsy();
    expect(getInputElement(nativeElement, '#employer-name input').value).toBeFalsy();
    expect(getInputElement(nativeElement, '#number-of-positions input').value).toEqual('0');
    expect(component.formGroup().get('startDate')?.value).toBeFalsy();
    expect(component.formGroup().get('endDate')?.value).toBeFalsy();

    //Act: change form values
    component.formGroup().get('jobTitle')?.setValue('Dragon Wrangler');
    component.formGroup().get('numberOfPositions')?.setValue(3);
    component.formGroup().get('startDate')?.setValue(beginDateString);
    component.formGroup().get('endDate')?.setValue(endDateString);
    expect(component.formGroup().valid).toEqual(true);
    component.onSubmit();
    await fixture.whenStable();

    //Assert record changed
    expect(actualModelInPostRequest.jobTitle).toEqual('Dragon Wrangler');
    expect(actualModelInPostRequest.numberOfPositions).toEqual(3);
    expect(actualModelInPostRequest.startDate).toEqual(beginDateString);
    expect(actualModelInPostRequest.endDate).toEqual(endDateString);
  });

  it('Load an existing job to be edited from this form', async () => {
    const recordId = 7;
    const initialDbRecord = Object.assign(new Job(), {
      jobId: recordId,
      jobTitle: 'Fire Inspector',
      employerName: 'City of Dragonford',
      filledPositions: 1,
      numberOfPositions: 4,
      startDate: beginDateString,
      endDate: endDateString,
    });

    const mockHttpClient = new AssignmentHttpClient();
    mockHttpClient.getJob = () => {
      return of({
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: JSON.parse(JSON.stringify(initialDbRecord))
      } as ValidatedPayload<Job>);
    };

    let actualRecordIdInPutRequest: number = 0;
    let actualModelInPutRequest = new JobCreateEdit();
    mockHttpClient.putJobForm = (jobId: number, job: JobCreateEdit) => {
      actualRecordIdInPutRequest = jobId;
      actualModelInPutRequest = job;
      const validatedPayload = {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: JSON.parse(JSON.stringify(initialDbRecord))
      } as ValidatedPayload<Job>;
      return of(Effect.succeed(validatedPayload) as Effect.Effect<ValidatedPayload<Job>, ValidatedForm<ValidationFailures>, never>);
    };

    mockHttpClient.getAllSkills = () => {
      return of({
        offset: 0,
        limit: 20,
        totalRecords: 0,
        data: []
      } as PagedData<SkillTag>);
    };

    const mockActivatedRoute = new MockActivatedRoute();
    const mockParams: Record<string, number> = { ['jobId']: recordId };
    mockActivatedRoute.setParams(mockParams);
    TestBed.configureTestingModule({
      providers: [
        { provide: AssignmentHttpClient, useValue: mockHttpClient },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    //Act
    await TestBed.configureTestingModule({ imports: [JobForm] }).compileComponents();
    const fixture = TestBed.createComponent(JobForm);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    //Assert values at load
    expect(component).toBeTruthy();
    const nativeElement: HTMLDivElement = fixture.nativeElement;
    expect(getInputElement(nativeElement, '#job-title input').value).toEqual(initialDbRecord.jobTitle);
    expect(getInputElement(nativeElement, '#employer-name input').value).toEqual(initialDbRecord.employerName);
    expect(getInputElement(nativeElement, '#number-of-positions input').value).toEqual(initialDbRecord.numberOfPositions.toString());
    expect(component.formGroup().get('startDate')?.value).toEqual(beginDateString);
    expect(component.formGroup().get('endDate')?.value).toEqual(endDateString);

    //Act: change form values
    component.formGroup().get('jobTitle')?.setValue('Senior Fire Inspector');
    component.formGroup().get('numberOfPositions')?.setValue(5);
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    await fixture.whenStable();

    //Assert record changed
    expect(actualRecordIdInPutRequest).toEqual(recordId);
    expect(actualModelInPutRequest.jobTitle).toEqual('Senior Fire Inspector');
    expect(actualModelInPutRequest.numberOfPositions).toEqual(5);
  });

  it('Show server-side validation errors after a failed edit submission', async () => {
    const recordId = 7;
    const initialDbRecord = Object.assign(new Job(), {
      jobId: recordId,
      jobTitle: 'Fire Inspector',
      employerName: 'City of Dragonford',
      filledPositions: 1,
      numberOfPositions: 4,
      startDate: beginDateString,
      endDate: endDateString,
    });

    const mockHttpClient = new AssignmentHttpClient();
    mockHttpClient.getJob = () => {
      return of({
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: JSON.parse(JSON.stringify(initialDbRecord))
      } as ValidatedPayload<Job>);
    };

    const validationFailures: ValidationFailures = {
      fieldFailures: {
        //this comes from the server as a dictionary, so the field names are Pascal Case
        JobTitle: 'Job title is too short',
        NumberOfPositions: 'Number of positions must be positive',
      },
      gridRowFailures: {
      }
    };

    mockHttpClient.putJobForm = () => {
      const failedForm: ValidatedForm<ValidationFailures> = {
        isInternalError: false,
        isSuccess: false,
        validationFailures
      };
      return of(Effect.fail(failedForm) as Effect.Effect<ValidatedPayload<Job>, ValidatedForm<ValidationFailures>, never>);
    };

    mockHttpClient.getAllSkills = () => {
      return of({
        offset: 0,
        limit: 20,
        totalRecords: 0,
        data: []
      } as PagedData<SkillTag>);
    };

    const mockActivatedRoute = new MockActivatedRoute();
    const mockParams: Record<string, number> = { ['jobId']: recordId };
    mockActivatedRoute.setParams(mockParams);
    TestBed.configureTestingModule({
      providers: [
        { provide: AssignmentHttpClient, useValue: mockHttpClient },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    //Act
    await TestBed.configureTestingModule({ imports: [JobForm] }).compileComponents();
    const fixture = TestBed.createComponent(JobForm);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    // Simulate the user having touched all fields so that server-side errors will be visible
    component.formGroup().markAllAsTouched();
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    await fixture.whenStable();

    //Assert: each field with a server-side failure displays its error message
    const nativeElement: HTMLDivElement = fixture.nativeElement;
    expect(nativeElement.querySelector('#job-title p-message')?.textContent || '').toContain(validationFailures.fieldFailures["JobTitle"]);
    expect(nativeElement.querySelector('#number-of-positions p-message')?.textContent || '').toContain(validationFailures.fieldFailures["NumberOfPositions"]);
  });
});
