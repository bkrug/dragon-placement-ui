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
    expect(getInputElement(nativeElement, '#start-date-unix input').valueAsNumber).toEqual(0);
    expect(getInputElement(nativeElement, '#end-date-unix input').valueAsNumber).toEqual(0);

    //Act: change form values
    component.jobFormGroup().get('jobTitle')?.setValue('Dragon Wrangler');
    component.jobFormGroup().get('numberOfPositions')?.setValue(3);
    expect(component.jobFormGroup().valid).toEqual(true);
    component.onSubmit();
    await fixture.whenStable();

    //Assert record changed
    expect(actualModelInPostRequest.jobTitle).toEqual('Dragon Wrangler');
    expect(actualModelInPostRequest.numberOfPositions).toEqual(3);
  });

  it('Load an existing job to be edited from this form', async () => {
    const recordId = 7;
    const initialDbRecord = {
      jobId: recordId,
      jobTitle: 'Fire Inspector',
      employerName: 'City of Dragonford',
      filledPositions: 1,
      numberOfPositions: 4,
      startDateUnix: 1700000000,
      endDateUnix: 1800000000,
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
    expect(getInputElement(nativeElement, '#start-date-unix input').valueAsNumber).toEqual(initialDbRecord.startDateUnix);
    expect(getInputElement(nativeElement, '#end-date-unix input').valueAsNumber).toEqual(initialDbRecord.endDateUnix);

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
      startDateUnix: 1700000000,
      endDateUnix: 1800000000,
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
