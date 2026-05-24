import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { Dragon, Job, SkillTag } from '../../../poco/models';
import { PagedData, ValidatedPayload, ValidatedResponse } from '../../../poco/standard-responses';
import { MockActivatedRoute } from '../../../testHelpers/MockActivatedRoute';
import { ManageJob } from './manage-job';

const mockValidatedJob = (job: Job): ValidatedPayload<Job> =>
  ({ payload: job, isSuccess: true, isInternalError: false, validationFailures: [] });

describe('ManageJob', () => {
  const jobId = 12;
  const mockJob: Job = {
    jobId: jobId,
    jobTitle: 'Guard',
    employerName: 'Royal Games',
    numberOfPositions: 5,
    filledPositions: 0,
    startDateUnix: Math.floor(new Date(2026, 6, 15).getTime() / 1000),
    endDateUnix: Math.floor(new Date(2026, 6, 25).getTime() / 1000),
    skillTags: []
  };
  const mockDragon: Dragon = {
    dragonId: 25,
    givenName: 'Ichabod',
    familyName: 'Mane',
    canBreathFire: false,
    canTakePassengers: false,
    weightInKg: 3027,
    lengthInMeters: 54,
    fightingSkills: 'm',
    assignments: [],
    skillTags: []
  };

  it('When a dragon from the list of candidates is assigned, a request should be made for both dragon tables to reload data.', async () => {
    const mockHttpClient = new AssignmentHttpClient();
    mockHttpClient.getJob = async () => mockValidatedJob(mockJob);
    
    let getCandidateCount = 0;
    let getAssignedCount = 0;
    let postAssignmentCount = 0;
    mockHttpClient.getOnePageOfCandidates = async (_jobId: number, _skillTagIds: number[], _fightingSkilts: string | null, offset: number, limit: number) => {
      ++getCandidateCount;
      return { offset, limit, totalRecords: 1, data: [mockDragon] } as PagedData<Dragon>;
    };
    mockHttpClient.getOnePageOfAssignees = async (_jobId: number, offset: number, limit: number) => {
      ++getAssignedCount;
      return { offset, limit, totalRecords: 0, data: [] } as PagedData<Dragon>;
    };
    mockHttpClient.assignDragonToJob = async () => {
      ++postAssignmentCount;
      return { isSuccess: true, isInternalError: false, validationFailures: [] } as ValidatedResponse;
    };

    mockHttpClient.getAllSkills = async () => { return { offset: 0, limit: 0, totalRecords: 0, data: [] } as PagedData<SkillTag>; }

    const mockActivatedRoute = new MockActivatedRoute();
    const mockParams : Record<string, any> = { ['jobId'] : jobId };
    mockActivatedRoute.setParams(mockParams);    

    //Act
    await TestBed.configureTestingModule({
      imports: [ManageJob],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AssignmentHttpClient, useValue: mockHttpClient },
      ]
    }).compileComponents();
    const fixture = TestBed.createComponent(ManageJob);
    const component = fixture.componentInstance;
    await fixture.whenStable();
    const nativeElement = fixture.nativeElement as HTMLElement;

    //Assert
    expect(component).toBeTruthy();

    //Act: Assign one dragon
    getCandidateCount = getAssignedCount = 0;
    const candidateRows = Array.from(nativeElement.querySelectorAll('#candidate-table tr')).map(e => e as HTMLTableRowElement);
    const rowToAssign = candidateRows.slice(-1)[0];
    const button = Array.from(rowToAssign.querySelectorAll('button')).filter(b => b.textContent === 'Assign')[0];
    button.click();
    await fixture.whenStable();

    //Assert that expected Http requests were made
    expect(postAssignmentCount).toEqual(1);
    expect(getCandidateCount).toEqual(1);
    expect(getAssignedCount).toEqual(1);
  });

  it('When a dragon from the list of assigned individuals is unassigned, a request should be made for both dragon tables to reload data.', async () => {
    const mockHttpClient = new AssignmentHttpClient();
    mockHttpClient.getJob = async () => mockValidatedJob(mockJob);

    let getCandidateCount = 0;
    let getAssignedCount = 0;
    let deleteAssignmentCount = 0;
    mockHttpClient.getOnePageOfCandidates = async (_jobId: number, _skillTagIds: number[], _fightingSkilts: string | null, offset: number, limit: number) => {
      ++getCandidateCount;
      return { offset, limit, totalRecords: 1, data: [] } as PagedData<Dragon>;
    };
    mockHttpClient.getOnePageOfAssignees = async (_jobId: number, offset: number, limit: number) => {
      ++getAssignedCount;
      return { offset, limit, totalRecords: 0, data: [mockDragon] } as PagedData<Dragon>;
    };
    mockHttpClient.unassignDragonToJob = async () => {
      ++deleteAssignmentCount;
      return { isSuccess: true, isInternalError: false, validationFailures: [] } as ValidatedResponse;
    };

    mockHttpClient.getAllSkills = async () => { return { offset: 0, limit: 0, totalRecords: 0, data: [] } as PagedData<SkillTag>; }

    const mockActivatedRoute = new MockActivatedRoute();
    const mockParams : Record<string, any> = { ['jobId'] : jobId };
    mockActivatedRoute.setParams(mockParams);

    //Act
    await TestBed.configureTestingModule({
      imports: [ManageJob],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AssignmentHttpClient, useValue: mockHttpClient },
      ]
    }).compileComponents();
    const fixture = TestBed.createComponent(ManageJob);
    const component = fixture.componentInstance;
    await fixture.whenStable();
    const nativeElement = fixture.nativeElement as HTMLElement;

    //Assert
    expect(component).toBeTruthy();

    //Act: Unassign one dragon
    getCandidateCount = getAssignedCount = 0;
    const assignedRows = Array.from(nativeElement.querySelectorAll('#assigned-table tr')).map(e => e as HTMLTableRowElement);
    const rowToUnassign = assignedRows.slice(-1)[0];
    const button = Array.from(rowToUnassign.querySelectorAll('button')).filter(b => b.textContent === 'Unassign')[0];
    button.click();
    await fixture.whenStable();

    //Assert that expected Http requests were made
    expect(deleteAssignmentCount).toEqual(1);
    expect(getCandidateCount).toEqual(1);
    expect(getAssignedCount).toEqual(1);
  });
});
