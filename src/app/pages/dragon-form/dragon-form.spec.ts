import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Effect } from 'effect';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { JobInclusions } from '../../../poco/enums';
import { Dragon, DragonValidationFailures } from '../../../poco/models';
import { ValidatedForm, ValidatedPayload } from '../../../poco/standard-responses';
import { MockActivatedRoute } from '../../../testHelpers/MockActivatedRoute';
import { DragonForm } from './dragon-form';

//TODO: Assert that there is no junk data in the form, and that no HttpMethods were called
describe('Load a blank Dragon Form for creation of a dragon', () => {
  let component: DragonForm;
  let fixture: ComponentFixture<DragonForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragonForm],
    }).compileComponents();
  });

  it('should create', async () => {
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
});

describe('Load an existing dragon to be edited from this form', () => {
  let component: DragonForm;
  let fixture: ComponentFixture<DragonForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragonForm],
    }).compileComponents();
  });

  it('should create', async () => {
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
    mockHttpClient.putDragonForm = async (dragonId: number, dragon: Dragon) => {
      const validatedPayload = {
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: {
          dragonId: dragonId,
          givenName: 'Girbit',
          familyName: 'Smokeson',
          canBreathFire: true,
          canTakePassengers: false,
          lengthInMeters: 35,
          weightInKg: 2409,
          fightingSkills: 'b'
        } as Dragon
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
    
    //Assert
    expect(component).toBeTruthy();
    const nativeElement: HTMLDivElement = fixture.nativeElement;
    const givenNameInput = nativeElement.querySelector('#given-name');
    expect(givenNameInput?.textContent).toEqual('Girbit');
  });
});
