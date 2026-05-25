import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Effect } from 'effect';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { DragonCreateEdit } from '../../../poco/endpointRequestBodies';
import { Dragon, DragonValidationFailures, SkillTag } from '../../../poco/models';
import { PagedData, ValidatedForm, ValidatedPayload } from '../../../poco/standard-responses';
import { MockActivatedRoute } from '../../../testHelpers/MockActivatedRoute';
import { DragonForm } from './dragon-form';

describe('Dragon Form Tests', () => {
  function getInputElement(nativeElement:HTMLDivElement, css:string) {
    return nativeElement.querySelector(css) as HTMLInputElement;
  }

  it('Load a blank Dragon Form for creation of a dragon', async () => {
    const mockHttpClient = new AssignmentHttpClient();
    let getMethodWasCalled = false;
    mockHttpClient.getDragonWithJobs = async () => {
      getMethodWasCalled = true;
      return {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: new Dragon()
      } as ValidatedPayload<Dragon>;
    };

    let actualModelInPostRequest = new DragonCreateEdit();
    mockHttpClient.postDragonForm = async (dragon: DragonCreateEdit) => {
      actualModelInPostRequest = dragon;
      const validatedPayload = {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: Object.assign(new Dragon(), {
          dragonId: 298,
          givenName: dragon.givenName,
          familyName: dragon.familyName,
          weightInKg: dragon.weightInKg,
          lengthInMeters: dragon.lengthInMeters,
          fightingSkills: dragon.fightingSkills
        })
      } as ValidatedPayload<Dragon>;
      return Effect.succeed(validatedPayload) as Effect.Effect<ValidatedPayload<Dragon>, ValidatedForm<DragonValidationFailures>, never>;
    };

    mockHttpClient.getAllSkills = async () => {
      return {
        offset: 0,
        limit: 20,
        totalRecords: 0,
        data: []
      } as PagedData<SkillTag>;
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
    await TestBed.configureTestingModule({ imports: [DragonForm], }).compileComponents();
    const fixture = TestBed.createComponent(DragonForm);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    //Assert: fields should be empty
    expect(component).toBeTruthy();
    expect(getMethodWasCalled).toEqual(false);
    const nativeElement: HTMLDivElement = fixture.nativeElement;
    expect(getInputElement(nativeElement, '#given-name input').value).toBeFalsy();
    expect(getInputElement(nativeElement, '#family-name input').value).toBeFalsy();
    expect(component.formGroup().get('lengthInMeters')?.value).toBeFalsy();
    expect(component.formGroup().get('weightInKg')?.value).toBeFalsy();
    expect(component.formGroup().get('fightingSkills')?.value).toBeFalsy();

    //Act: change form values
    component.formGroup().get('givenName')?.setValue('Susan');
    expect(component.formGroup().valid).toEqual(true);
    // const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    // submitButton.click();
    component.onSubmit();
    await fixture.whenStable();

    //Assert record changed
    expect(actualModelInPostRequest.givenName).toEqual('Susan');
  });

  it('Load an existing dragon to be edited from this form', async () => {
    const recordId = 15;
    const initialDbRecord = Object.assign(new Dragon(), {
      dragonId: recordId,
      givenName: 'Girbit',
      familyName: 'Smokeson',
      lengthInMeters: 35,
      weightInKg: 2409,
      fightingSkills: 'b'
    });

    const mockHttpClient = new AssignmentHttpClient();
    mockHttpClient.getDragonWithJobs = async () => {
      return {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: JSON.parse(JSON.stringify(initialDbRecord))
      } as ValidatedPayload<Dragon>;
    };

    let actualRecordIdInPutRequest: number = 0;
    let actualModelInPutRequest = new DragonCreateEdit();
    mockHttpClient.putDragonForm = async (dragonId: number, dragon: DragonCreateEdit) => {
      actualRecordIdInPutRequest = dragonId;
      actualModelInPutRequest = dragon;
      const validatedPayload = {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: JSON.parse(JSON.stringify(initialDbRecord))
      } as ValidatedPayload<Dragon>;
      return Effect.succeed(validatedPayload) as Effect.Effect<ValidatedPayload<Dragon>, ValidatedForm<DragonValidationFailures>, never>;
    };

    mockHttpClient.getAllSkills = async () => {
      return {
        offset: 0,
        limit: 20,
        totalRecords: 0,
        data: []
      } as PagedData<SkillTag>;
    };

    const mockActivatedRoute = new MockActivatedRoute();
    const mockParams : Record<string, number> = { ['dragonId'] : recordId };
    mockActivatedRoute.setParams(mockParams);
    TestBed.configureTestingModule({
      providers: [
        { provide: AssignmentHttpClient, useValue: mockHttpClient },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    //Act
    await TestBed.configureTestingModule({ imports: [DragonForm], }).compileComponents();
    const fixture = TestBed.createComponent(DragonForm);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    //Assert values at load
    expect(component).toBeTruthy();
    const nativeElement: HTMLDivElement = fixture.nativeElement;
    expect(getInputElement(nativeElement, '#given-name input').value).toEqual(initialDbRecord.givenName);
    expect(getInputElement(nativeElement, '#family-name input').value).toEqual(initialDbRecord.familyName);
    expect(component.formGroup().get('lengthInMeters')?.value).toEqual(initialDbRecord.lengthInMeters);
    expect(component.formGroup().get('weightInKg')?.value).toEqual(initialDbRecord.weightInKg);
    expect(component.formGroup().get('fightingSkills')?.value).toEqual(initialDbRecord.fightingSkills);

    //Act: change form values
    component.formGroup().get('givenName')?.setValue('Gilbert');
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    await fixture.whenStable();

    //Assert record changed
    expect(actualRecordIdInPutRequest).toEqual(recordId);
    expect(actualModelInPutRequest.givenName).toEqual('Gilbert');
  });

  it('Show server-side validation errors after a failed edit submission', async () => {
    const recordId = 15;
    const initialDbRecord = Object.assign(new Dragon(), {
      dragonId: recordId,
      givenName: 'Girbit',
      familyName: 'Smokeson',
      lengthInMeters: 35,
      weightInKg: 2409,
      fightingSkills: 'b'
    });

    const mockHttpClient = new AssignmentHttpClient();
    mockHttpClient.getDragonWithJobs = async () => {
      return {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: JSON.parse(JSON.stringify(initialDbRecord))
      } as ValidatedPayload<Dragon>;
    };

    const validationFailures: DragonValidationFailures = {
      givenName: 'Given name is too short',
      weightInKg: 'Weight must be positive',
      lengthInMeters: 'Length must be positive',
      fightingSkills: 'Fighting skill level is not recognized'
    };

    mockHttpClient.putDragonForm = async () => {
      const failedForm: ValidatedForm<DragonValidationFailures> = {
        isInternalError: false,
        isSuccess: false,
        validationFailures
      };
      return Effect.fail(failedForm) as Effect.Effect<ValidatedPayload<Dragon>, ValidatedForm<DragonValidationFailures>, never>;
    };

    mockHttpClient.getAllSkills = async () => {
      return {
        offset: 0,
        limit: 20,
        totalRecords: 0,
        data: []
      } as PagedData<SkillTag>;
    };

    const mockActivatedRoute = new MockActivatedRoute();
    const mockParams: Record<string, number> = { ['dragonId']: recordId };
    mockActivatedRoute.setParams(mockParams);
    TestBed.configureTestingModule({
      providers: [
        { provide: AssignmentHttpClient, useValue: mockHttpClient },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    //Act
    await TestBed.configureTestingModule({ imports: [DragonForm] }).compileComponents();
    const fixture = TestBed.createComponent(DragonForm);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    // Simulate the user having touched all fields so that server-side errors will be visible
    component.formGroup().markAllAsTouched();
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    await fixture.whenStable();

    //Assert: each field with a server-side failure displays its error message
    const nativeElement: HTMLDivElement = fixture.nativeElement;
    expect(nativeElement.querySelector('#given-name p-message')?.textContent).toContain(validationFailures.givenName);
    expect(nativeElement.querySelector('#weight-in-kg p-message')?.textContent).toContain(validationFailures.weightInKg);
    expect(nativeElement.querySelector('#length-in-meters p-message')?.textContent).toContain(validationFailures.lengthInMeters);
    expect(nativeElement.querySelector('#fighting-skills p-message')?.textContent).toContain(validationFailures.fightingSkills);
  });

  it('Show a general error message after a failed edit submission with an internal server error', async () => {
    const recordId = 15;
    const initialDbRecord = Object.assign(new Dragon(), {
      dragonId: recordId,
      givenName: 'Girbit',
      familyName: 'Smokeson',
      lengthInMeters: 35,
      weightInKg: 2409,
      fightingSkills: 'b'
    });

    const mockHttpClient = new AssignmentHttpClient();
    mockHttpClient.getDragonWithJobs = async () => {
      return {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: JSON.parse(JSON.stringify(initialDbRecord))
      } as ValidatedPayload<Dragon>;
    };

    mockHttpClient.putDragonForm = async () => {
      const failedForm = {
        isInternalError: true,
        isSuccess: false,
        validationFailures: new DragonValidationFailures()
      } as ValidatedForm<DragonValidationFailures>;
      return Effect.fail(failedForm) as Effect.Effect<ValidatedPayload<Dragon>, ValidatedForm<DragonValidationFailures>, never>;
    };

    mockHttpClient.getAllSkills = async () => {
      return {
        offset: 0,
        limit: 20,
        totalRecords: 0,
        data: []
      } as PagedData<SkillTag>;
    };

    const mockActivatedRoute = new MockActivatedRoute();
    const mockParams: Record<string, number> = { ['dragonId']: recordId };
    mockActivatedRoute.setParams(mockParams);
    TestBed.configureTestingModule({
      providers: [
        { provide: AssignmentHttpClient, useValue: mockHttpClient },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    //Act
    await TestBed.configureTestingModule({ imports: [DragonForm] }).compileComponents();
    const fixture = TestBed.createComponent(DragonForm);
    await fixture.whenStable();

    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    await fixture.whenStable();

    //Assert: general error message is shown directly after the submit button
    const nativeElement: HTMLDivElement = fixture.nativeElement;
    expect(nativeElement.querySelector('p-button + p-message')?.textContent).toContain('failed communication with the remote server');
  });

  it('Submit button shows "Submitting..." while waiting for a server response', async () => {
    const mockHttpClient = new AssignmentHttpClient();
    mockHttpClient.getDragonWithJobs = async () => ({
      isInternalError: false,
      isSuccess: true,
      validationFailures: [],
      payload: new Dragon()
    } as ValidatedPayload<Dragon>);

    mockHttpClient.postDragonForm = async () => {
      const failedForm = {
        isInternalError: false,
        isSuccess: false,
        payload: new Dragon()
      } as ValidatedPayload<Dragon>;
      return Effect.succeed(failedForm) as Effect.Effect<ValidatedPayload<Dragon>, ValidatedForm<DragonValidationFailures>, never>;
    };

    mockHttpClient.getAllSkills = async () => {
      return {
        offset: 0,
        limit: 20,
        totalRecords: 0,
        data: []
      } as PagedData<SkillTag>;
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
    await TestBed.configureTestingModule({ imports: [DragonForm] }).compileComponents();
    const fixture = TestBed.createComponent(DragonForm);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    component.formGroup().get('givenName')?.setValue('Susan');
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    //submitButton.click();
    component.onSubmit();
    fixture.detectChanges();

    //Assert: button label changes while request is in flight
    expect(submitButton.textContent).toContain('Submitting...');
  });
});
