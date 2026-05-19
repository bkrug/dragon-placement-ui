import { inputBinding } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisplayJob } from '../../../../poco/models';
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
