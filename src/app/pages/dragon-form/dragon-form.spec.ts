import { ComponentFixture, TestBed } from '@angular/core/testing';
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
  let component: DragonForm;
  let fixture: ComponentFixture<DragonForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragonForm],
    }).compileComponents();
  });

  it('Load a blank Dragon Form for creation of a dragon', async () => {
    const mockHttpClient = new AssignmentHttpClient();
    mockHttpClient.getDragonWithJobs = async (dragonId: number, jobInclusions: JobInclusions) => {
      return {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: {
          dragonId: 15,
          givenName: 'Girbit',
          familyName: 'Smokeson',
          canBreathFire: true,
          canTakePassengers: true
        } as Dragon
      } as ValidatedPayload<Dragon>;
    };
    mockHttpClient.postDragonForm = async (dragon: Dragon) => {
      const validatedPayload = {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: {
          dragonId: 15,
          givenName: 'Girbit',
          familyName: 'Smokeson',
          canBreathFire: true,
          canTakePassengers: true
        } as Dragon
      } as ValidatedPayload<Dragon>;
      return Effect.succeed(validatedPayload) as Effect.Effect<ValidatedPayload<Dragon>, ValidatedForm<DragonValidationFailures>, never>;
    };
    mockHttpClient.putDragonForm = async (dragonId: number, dragon: Dragon) => {
      const validatedPayload = {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: {
          dragonId: 15,
          givenName: 'Girbit',
          familyName: 'Smokeson',
          canBreathFire: true,
          canTakePassengers: true
        } as Dragon
      } as ValidatedPayload<Dragon>;
      return Effect.succeed(validatedPayload) as Effect.Effect<ValidatedPayload<Dragon>, ValidatedForm<DragonValidationFailures>, never>;
    };
    const mockActivatedRoute = new MockActivatedRoute();
    mockActivatedRoute.setParams({ dragonId: null });
    TestBed.configureTestingModule({
      providers: [
        { provide: AssignmentHttpClient, useValue: mockHttpClient },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    //Act
    fixture = TestBed.createComponent(DragonForm, {
      bindings: []
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
    
    expect(1).toBe(1);
    expect(component).toBeTruthy();
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
    let actualRecordIdInPutRequest: number = -1;
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
    fixture = TestBed.createComponent(DragonForm, {
      bindings: []
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
    
    //Assert values at load
    expect(component).toBeTruthy();
    const nativeElement: HTMLDivElement = fixture.nativeElement;
    const givenNameInput = nativeElement.querySelector('#given-name input') as HTMLInputElement;
    expect(givenNameInput.value).toEqual(initialDbRecord.givenName);
    const familyNameInput = nativeElement.querySelector('#family-name input') as HTMLInputElement;
    expect(familyNameInput.value).toEqual(initialDbRecord.familyName);
    const canBreathFireCheck = nativeElement.querySelector('#can-breath-fire input') as HTMLInputElement;
    expect(canBreathFireCheck.checked).toEqual(initialDbRecord.canBreathFire);
    const canTakePassengersCheck = nativeElement.querySelector('#can-take-passengers input') as HTMLInputElement;
    expect(canTakePassengersCheck.checked).toEqual(initialDbRecord.canTakePassengers);
    const lengthInMetersInput = nativeElement.querySelector('#length-in-meters input') as HTMLInputElement;
    expect(lengthInMetersInput.valueAsNumber).toEqual(initialDbRecord.lengthInMeters);
    const weightInput = nativeElement.querySelector('#weight-in-kg input') as HTMLInputElement;
    expect(weightInput.valueAsNumber).toEqual(initialDbRecord.weightInKg);
    const fightingSkillsSelect = nativeElement.querySelector('#fighting-skills select') as HTMLSelectElement;
    expect(fightingSkillsSelect.value).toEqual(initialDbRecord.fightingSkills);

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
