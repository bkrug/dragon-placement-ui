import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Effect } from 'effect';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { Job, JobValidationFailures } from '../../../poco/models';
import { ValidatedForm, ValidatedPayload } from '../../../poco/standard-responses';
import { MockActivatedRoute } from '../../../testHelpers/MockActivatedRoute';
import { JobForm } from './job-form';

describe('Job Form Tests', () => {
  function getInputElement(nativeElement: HTMLDivElement, css: string) {
    return nativeElement.querySelector(css) as HTMLInputElement;
  }

  const beginDateUnix = 1262304000;
  const beginDateString = '2010-01-01';
  const endDateUnix = 1293753600;
  const endDateString = '2010-12-31';

  it('Load a blank Job Form for creation of a job', async () => {
    const mockHttpClient = new AssignmentHttpClient();
    let getMethodWasCalled = false;
    mockHttpClient.getJob = async () => {
      getMethodWasCalled = true;
      return {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: new Job()
      } as ValidatedPayload<Job>;
    };

    let actualModelInPostRequest: Job = new Job();
    mockHttpClient.postJobForm = async (job: Job) => {
      actualModelInPostRequest = job;
      const validatedPayload = {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: job
      } as ValidatedPayload<Job>;
      return Effect.succeed(validatedPayload) as Effect.Effect<ValidatedPayload<Job>, ValidatedForm<JobValidationFailures>, never>;
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
    expect(getInputElement(nativeElement, '#number-of-positions input').valueAsNumber).toEqual(0);
    expect(getInputElement(nativeElement, '#start-date input').value).toBeFalsy();
    expect(getInputElement(nativeElement, '#end-date input').value).toBeFalsy();

    //Act: change form values
    component.jobFormGroup().get('jobTitle')?.setValue('Dragon Wrangler');
    component.jobFormGroup().get('numberOfPositions')?.setValue(3);
    component.jobFormGroup().get('startDate')?.setValue(beginDateString);
    component.jobFormGroup().get('endDate')?.setValue(endDateString);
    expect(component.jobFormGroup().valid).toEqual(true);
    component.onSubmit();
    await fixture.whenStable();

    //Assert record changed
    expect(actualModelInPostRequest.jobTitle).toEqual('Dragon Wrangler');
    expect(actualModelInPostRequest.numberOfPositions).toEqual(3);
    expect(actualModelInPostRequest.startDateUnix).toEqual(beginDateUnix);
    expect(actualModelInPostRequest.endDateUnix).toEqual(endDateUnix);
  });

  it('Load an existing job to be edited from this form', async () => {
    const recordId = 7;
    const initialDbRecord = {
      jobId: recordId,
      jobTitle: 'Fire Inspector',
      employerName: 'City of Dragonford',
      filledPositions: 1,
      numberOfPositions: 4,
      startDateUnix: beginDateUnix,
      endDateUnix: endDateUnix,
    } as Job;

    const mockHttpClient = new AssignmentHttpClient();
    mockHttpClient.getJob = async () => {
      return {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: JSON.parse(JSON.stringify(initialDbRecord))
      } as ValidatedPayload<Job>;
    };

    let actualRecordIdInPutRequest: number = 0;
    let actualModelInPutRequest: Job = new Job();
    mockHttpClient.putJobForm = async (jobId: number, job: Job) => {
      actualRecordIdInPutRequest = jobId;
      actualModelInPutRequest = job;
      const validatedPayload = {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: JSON.parse(JSON.stringify(initialDbRecord))
      } as ValidatedPayload<Job>;
      return Effect.succeed(validatedPayload) as Effect.Effect<ValidatedPayload<Job>, ValidatedForm<JobValidationFailures>, never>;
    };

    const mockActivatedRoute = new MockActivatedRoute();
    const mockParams: Record<string, any> = { ['jobId']: recordId };
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
    expect(getInputElement(nativeElement, '#number-of-positions input').valueAsNumber).toEqual(initialDbRecord.numberOfPositions);
    expect(getInputElement(nativeElement, '#start-date input').value).toEqual(beginDateString);
    expect(getInputElement(nativeElement, '#end-date input').value).toEqual(endDateString);

    //Act: change form values
    component.jobFormGroup().get('jobTitle')?.setValue('Senior Fire Inspector');
    component.jobFormGroup().get('numberOfPositions')?.setValue(5);
    const submitButton = fixture.nativeElement.querySelector('button');
    submitButton.click();
    await fixture.whenStable();

    //Assert record changed
    expect(actualRecordIdInPutRequest).toEqual(recordId);
    expect(actualModelInPutRequest.jobTitle).toEqual('Senior Fire Inspector');
    expect(actualModelInPutRequest.numberOfPositions).toEqual(5);
  });

  it('Show server-side validation errors after a failed edit submission', async () => {
    const recordId = 7;
    const initialDbRecord = {
      jobId: recordId,
      jobTitle: 'Fire Inspector',
      employerName: 'City of Dragonford',
      filledPositions: 1,
      numberOfPositions: 4,
      startDateUnix: beginDateUnix,
      endDateUnix: endDateUnix,
    } as Job;

    const mockHttpClient = new AssignmentHttpClient();
    mockHttpClient.getJob = async () => {
      return {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: JSON.parse(JSON.stringify(initialDbRecord))
      } as ValidatedPayload<Job>;
    };

    const validationFailures: JobValidationFailures = {
      jobTitle: 'Job title is too short',
      numberOfPositions: 'Number of positions must be positive',
    };

    mockHttpClient.putJobForm = async () => {
      const failedForm: ValidatedForm<JobValidationFailures> = {
        isInternalError: false,
        isSuccess: false,
        validationFailures
      };
      return Effect.fail(failedForm) as Effect.Effect<ValidatedPayload<Job>, ValidatedForm<JobValidationFailures>, never>;
    };

    const mockActivatedRoute = new MockActivatedRoute();
    const mockParams: Record<string, any> = { ['jobId']: recordId };
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
    component.jobFormGroup().markAllAsTouched();
    const submitButton = fixture.nativeElement.querySelector('button');
    submitButton.click();
    await fixture.whenStable();

    //Assert: each field with a server-side failure displays its error message
    const nativeElement: HTMLDivElement = fixture.nativeElement;
    expect(nativeElement.querySelector('#job-title p-message')?.textContent).toContain(validationFailures.jobTitle);
    expect(nativeElement.querySelector('#number-of-positions p-message')?.textContent).toContain(validationFailures.numberOfPositions);
  });
});
