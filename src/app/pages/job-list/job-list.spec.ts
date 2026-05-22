import { TestBed } from '@angular/core/testing';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { Job } from '../../../poco/models';
import { PagedData } from '../../../poco/standard-responses';
import { JobList } from './job-list';

describe('JobList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobList],
    }).compileComponents();
  });

  it('Data coming from the http client should be displayed in job list data table.', async () => {
    const payloadData = [
      {
        jobId: 1,
        jobTitle: 'CPA',
        employerName: 'The Ocean',
        filledPositions: 1,
        numberOfPositions: 3,
        startDateUnix: 0,
        endDateUnix: 1
      },
      {
        jobId: 1,
        jobTitle: 'GPD',
        employerName: 'The Sky',
        filledPositions: 2,
        numberOfPositions: 2,
        startDateUnix: 2,
        endDateUnix: 3
      }
    ];
    const mockHttpClient = new AssignmentHttpClient();
    mockHttpClient.getOnePageOfJobs = async (offset: number, limit: number) => {
      return {
        offset: offset,
        limit: limit,
        totalRecords: 2,
        data: payloadData
      } as PagedData<Job>;
    };

    TestBed.configureTestingModule({
      providers: [{ provide:AssignmentHttpClient, useValue:mockHttpClient }]
    });

    //Act
    const fixture = TestBed.createComponent(JobList);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    //Assert
    expect(component).toBeTruthy();
    const jobList:HTMLElement = fixture.nativeElement;
    const htmlTableRows = jobList.querySelectorAll('tr');
    const headerRowCount = 1;
    expect(htmlTableRows.length).toBe(headerRowCount + payloadData.length);
    expect(htmlTableRows[1].cells[1].textContent).toBe(payloadData[0].jobTitle);
    expect(htmlTableRows[2].cells[1].textContent).toBe(payloadData[1].jobTitle);
  });

  it('When the user selects a row in the job table, more details about that job should appear.', async () => {
    const payloadData = [
      {
        jobId: 1,
        jobTitle: 'CPA',
        employerName: 'The Ocean',
        filledPositions: 1,
        numberOfPositions: 3,
        startDateUnix: 0,
        endDateUnix: 1
      },
      {
        jobId: 1,
        jobTitle: 'GPD',
        employerName: 'The Sky',
        filledPositions: 2,
        numberOfPositions: 2,
        startDateUnix: 2,
        endDateUnix: 3
      }
    ];
    const mockHttpClient = new AssignmentHttpClient();
    mockHttpClient.getOnePageOfJobs = async (offset: number, limit: number) => {
      return {
        offset: offset,
        limit: limit,
        totalRecords: 2,
        data: payloadData
      } as PagedData<Job>;
    };

    TestBed.configureTestingModule({
      providers: [{ provide:AssignmentHttpClient, useValue:mockHttpClient }]
    });

    //Act
    const fixture = TestBed.createComponent(JobList);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    //Assert
    expect(component).toBeTruthy();

    //Act: Select the last row
    const jobList:HTMLElement = fixture.nativeElement;
    const htmlTableRows = jobList.querySelectorAll('tr');
    htmlTableRows[htmlTableRows.length - 1].click();
    await fixture.whenStable();

    //Assert: job management screen is visible
    const header2s = Array.from(jobList.querySelectorAll('h2')).map(h2 => h2.textContent);
    expect(header2s.length).toEqual(1);
    expect(header2s).toContain('Job to Fill');
    const header3s = Array.from(jobList.querySelectorAll('h3')).map(h2 => h2.textContent);
    expect(header3s).toContain('Assigned Dragons');
    expect(header3s).toContain('Dragons Available to Assign');
  });
});
