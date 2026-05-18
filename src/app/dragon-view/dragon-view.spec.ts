import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AssignmentHttpClient } from '../../httpClients/assignment-http-client';
import { JobInclusions } from '../../poco/enums';
import { Dragon } from '../../poco/models';
import { ValidatedPayload } from '../../poco/standard-responses';
import { MockActivatedRoute } from '../../testHelpers/MockActivatedRoute';
import { DragonView } from './dragon-view';

describe('DragonView', () => {
  let component: DragonView;
  let fixture: ComponentFixture<DragonView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragonView],
    }).compileComponents();
  });

  it('should create', async () => {
    class MockHttpClient implements AssignmentHttpClient {
      getOnePageOfDragons = AssignmentHttpClient.prototype.getOnePageOfDragons;
      getOnePageOfCandidates = AssignmentHttpClient.prototype.getOnePageOfCandidates;
      getOnePageOfAssignees = AssignmentHttpClient.prototype.getOnePageOfAssignees;

      async getDragonWithJobs(dragonId: number, jobInclusions: JobInclusions) {
        return {
          isInternalError: false,
          isSuccess: true,
          validationFailures: [],
          payload: {
            dragonId: dragonId,
            givenName: 'Girbit',
            familyName: 'Smokeson',
            canBreathFire: true,
            canTakePassengers: true,
            weightInKg: null,
            lengthInMeters: null,
            fightingSkills: null,
            assignments: []
          } as Dragon
        } as ValidatedPayload<Dragon>;
      };

      assignDragonToJob = AssignmentHttpClient.prototype.assignDragonToJob;
      unassignDragonToJob = AssignmentHttpClient.prototype.unassignDragonToJob;
      postDragonForm = AssignmentHttpClient.prototype.postDragonForm;
      putDragonForm = AssignmentHttpClient.prototype.putDragonForm;
    };      
    const mockActivatedRoute = new MockActivatedRoute();
    mockActivatedRoute.setParams({ dragonId: 15 });
    TestBed.configureTestingModule({
      providers: [
        { provide: AssignmentHttpClient, useClass: MockHttpClient },
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
