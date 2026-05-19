import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Effect } from 'effect';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { JobInclusions } from '../../../poco/enums';
import { Dragon, DragonValidationFailures } from '../../../poco/models';
import { ValidatedForm, ValidatedPayload } from '../../../poco/standard-responses';
import { MockActivatedRoute } from '../../../testHelpers/MockActivatedRoute';
import { DragonForm } from './dragon-form';

//TODO: Assert that there is no junk data in the form, and that no HttpMethods were called
describe('Dragon Form Tests', () => {
  function getInputElement(nativeElement:HTMLDivElement, css:string) {
    return nativeElement.querySelector(css) as HTMLInputElement;
  }

  function getSelectElement(nativeElement:HTMLDivElement, css:string) {
    return nativeElement.querySelector(css) as HTMLSelectElement;
  }

  it('Load a blank Dragon Form for creation of a dragon', async () => {
    const mockHttpClient = new AssignmentHttpClient();
    let getMethodWasCalled = false;
    mockHttpClient.getDragonWithJobs = async (dragonId: number, jobInclusions: JobInclusions) => {
      getMethodWasCalled = true;
      return {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: new Dragon()
      } as ValidatedPayload<Dragon>;
    };

    let actualModelInPostRequest: Dragon = new Dragon();
    mockHttpClient.postDragonForm = async (dragon: Dragon) => {
      actualModelInPostRequest = dragon;
      const validatedPayload = {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: dragon
      } as ValidatedPayload<Dragon>;
      return Effect.succeed(validatedPayload) as Effect.Effect<ValidatedPayload<Dragon>, ValidatedForm<DragonValidationFailures>, never>;
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
    expect(getInputElement(nativeElement, '#can-breath-fire input').checked).toEqual(false);
    expect(getInputElement(nativeElement, '#can-take-passengers input').checked).toEqual(false);
    expect(getInputElement(nativeElement, '#length-in-meters input').value).toBeFalsy();
    expect(getInputElement(nativeElement, '#weight-in-kg input').value).toBeFalsy();
    expect(getSelectElement(nativeElement, '#fighting-skills select').value).toBeFalsy();

    //Act: change form values
    component.dragonFormGroup().get('givenName')?.setValue('Susan');
    component.dragonFormGroup().get('canBreathFire')?.setValue(true);
    expect(component.dragonFormGroup().valid).toEqual(true);
    //const submitButton = fixture.nativeElement.querySelector('button');
    //submitButton.click();
    component.onSubmit();
    await fixture.whenStable();

    //Assert record changed
    expect(actualModelInPostRequest.givenName).toEqual('Susan');
    expect(actualModelInPostRequest.canBreathFire).toEqual(true);    
  });

  it('Load an existing dragon to be edited from this form', async () => {
    const recordId = 15;
    const initialDbRecord = {
      dragonId: recordId,
      givenName: 'Girbit',
      familyName: 'Smokeson',
      canBreathFire: true,
      canTakePassengers: false,
      lengthInMeters: 35,
      weightInKg: 2409,
      fightingSkills: 'b'
    } as Dragon;

    const mockHttpClient = new AssignmentHttpClient();
    mockHttpClient.getDragonWithJobs = async (dragonId: number, jobInclusions: JobInclusions) => {
      return {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: JSON.parse(JSON.stringify(initialDbRecord))
      } as ValidatedPayload<Dragon>;
    };

    let actualRecordIdInPutRequest: number = 0;
    let actualModelInPutRequest: Dragon = new Dragon();
    mockHttpClient.putDragonForm = async (dragonId: number, dragon: Dragon) => {
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

    const mockActivatedRoute = new MockActivatedRoute();
    const mockParams : { [key:string] : any } = { ['dragonId'] : recordId };
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
    expect(getInputElement(nativeElement, '#can-breath-fire input').checked).toEqual(initialDbRecord.canBreathFire);
    expect(getInputElement(nativeElement, '#can-take-passengers input').checked).toEqual(initialDbRecord.canTakePassengers);
    expect(getInputElement(nativeElement, '#length-in-meters input').valueAsNumber).toEqual(initialDbRecord.lengthInMeters);
    expect(getInputElement(nativeElement, '#weight-in-kg input').valueAsNumber).toEqual(initialDbRecord.weightInKg);
    expect(getSelectElement(nativeElement, '#fighting-skills select').value).toEqual(initialDbRecord.fightingSkills);

    //Act: change form values
    component.dragonFormGroup().get('givenName')?.setValue('Gilbert');
    component.dragonFormGroup().get('canTakePassengers')?.setValue(true);
    const submitButton = fixture.nativeElement.querySelector('button');
    submitButton.click();
    await fixture.whenStable();

    //Assert record changed
    expect(actualRecordIdInPutRequest).toEqual(recordId);
    expect(actualModelInPutRequest.givenName).toEqual('Gilbert');
    expect(actualModelInPutRequest.canTakePassengers).toEqual(true);
  });
});
