import { inputBinding } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignmentHttpClient } from '../../../../httpClients/assignment-http-client';
import { DisplayJob, Dragon } from '../../../../poco/models';
import { PagedData, ValidatedResponse } from '../../../../poco/standard-responses';
import { ManageJob } from './manage-job';

//TODO: Add tests that assert what happens when a dragon is added or deleted from a job

describe('ManageJob', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageJob],
    }).compileComponents();
  });

  it('When a dragon from the list of candidates is assigned, a request should be made for both dragon tables to reload data.', async () => {
    const mockJob = {
      jobId: 12,
      jobTitle: 'Guard',
      employerName: 'Royal Games',
      openPositions: 5,
      numberOfPositions: 5,
      openDescription: '5 of 5 open',
      startDate: new Date(2026, 6, 15),
      endDate: new Date(2026, 6, 25)
    } as DisplayJob;
    const mockDragon = {
      dragonId: 25,
      givenName: 'Ichabod',
      familyName: 'Mane',
      canBreathFire: false,
      canTakePassengers: false,
      weightInKg: 3027,
      lengthInMeters: 54,
      fightingSkills: 'm',
      assignments: []
    } as Dragon;

    const mockHttpClient = new AssignmentHttpClient();
    let getCandidateCount = 0;
    let getAssignedCount = 0;
    let postAssignmentCount = 0;
    mockHttpClient.getOnePageOfCandidates = async (_jobId: number, offset: number, limit: number) => {
      ++getCandidateCount;
      return {
        offset: offset,
        limit: limit,
        totalRecords: 1,
        data: [ mockDragon ]
      } as PagedData<Dragon>;
    };
    mockHttpClient.getOnePageOfAssignees = async (_jobId: number, offset: number, limit: number) => {
      ++getAssignedCount;
      return {
        offset: offset,
        limit: limit,
        totalRecords: 0,
        data: []
      } as PagedData<Dragon>;
    };
    mockHttpClient.assignDragonToJob = async (dragonId: number, jobId: number) => {
      ++postAssignmentCount;
      return {
        isSuccess: true,
        isInternalError: false,
        validationFailures: []
      } as ValidatedResponse;
    };

    //Act
    TestBed.configureTestingModule({
      providers: [
        { provide: AssignmentHttpClient, useValue: mockHttpClient },
      ]
    });
    const fixture = TestBed.createComponent(ManageJob, {
      bindings: [
        inputBinding('selectedJob', () => mockJob),
      ]
    });
    const component = fixture.componentInstance;
    await fixture.whenStable();
    const nativeElement = fixture.nativeElement as HTMLElement;

    //Assert
    expect(component).toBeTruthy();

    //Act: Assign one dragon
    getCandidateCount = getAssignedCount = 0;
    const candidateRows = Array.from(nativeElement.querySelectorAll('#candidate-table tr')).map(e => e as HTMLTableRowElement);
    const rowToAssign = candidateRows.slice(-1)[0];
    console.log('rowToAssign', rowToAssign);
    rowToAssign.querySelector('button')?.click();
    await fixture.whenStable();

    //Assert that expect Http request were made
    expect(postAssignmentCount).toEqual(1);
    expect(getCandidateCount).toEqual(1);
    expect(getAssignedCount).toEqual(1);
  });
});
