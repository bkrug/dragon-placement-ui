import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { Dragon } from '../../../poco/models';
import { ValidatedPayload } from '../../../poco/standard-responses';
import { MockActivatedRoute } from '../../../testHelpers/MockActivatedRoute';
import { DragonView } from './dragon-view';

describe('DragonView', () => {
  let component: DragonView;
  let fixture: ComponentFixture<DragonView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragonView],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('should create', async () => {
    const mockHttpClient = new AssignmentHttpClient();
    mockHttpClient.getDragonWithJobs = (dragonId: number) => {
      return of({
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: {
          dragonId: dragonId,
          givenName: 'Girbit',
          familyName: 'Smokeson',
          weightInKg: null,
          lengthInMeters: null,
          fightingSkills: null,
          assignments: [],
          skillTags: []
        } as Dragon
      } as ValidatedPayload<Dragon>);
    };
    const mockActivatedRoute = new MockActivatedRoute();
    mockActivatedRoute.setParams({ dragonId: 15 });
    TestBed.configureTestingModule({
      providers: [
        { provide: AssignmentHttpClient, useValue: mockHttpClient },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });
    fixture = TestBed.createComponent(DragonView);
    component = fixture.componentInstance;
    await fixture.whenStable();

    //Act
    expect(component).toBeTruthy();
  });
});
