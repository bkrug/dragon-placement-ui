import { inputBinding } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignmentHttpClient } from '../../../../httpClients/assignment-http-client';
import { DisplayJob, Dragon } from '../../../../poco/models';
import { PagedData } from '../../../../poco/standard-responses';
import { ManageJob } from './manage-job';

//TODO: Add tests that assert what happens when a dragon is added or deleted from a job

describe('ManageJob', () => {
  let component: ManageJob;
  let fixture: ComponentFixture<ManageJob>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageJob],
    }).compileComponents();
  });

  it('should create', async () => {
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

    const mockHttpClient = new AssignmentHttpClient();
    mockHttpClient.getOnePageOfCandidates = async (jobId: number, offset: number, limit: number) => {
      return {
        offset: offset,
        limit: limit,
        totalRecords: 0,
        data: []
      } as PagedData<Dragon>;
    };
    mockHttpClient.getOnePageOfAssignees = async (jobId: number, offset: number, limit: number) => {
      return {
        offset: offset,
        limit: limit,
        totalRecords: 0,
        data: []
      } as PagedData<Dragon>;
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AssignmentHttpClient, useValue: mockHttpClient },
      ]
    });    
    fixture = TestBed.createComponent(ManageJob, {
      bindings: [
        inputBinding('selectedJob', () => mockJob),
      ]
    });
    component = fixture.componentInstance;
    await fixture.whenStable();

    expect(component).toBeTruthy();
  });
});
