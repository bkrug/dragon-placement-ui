import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { Job } from '../../../poco/models';
import { PagedData } from '../../../poco/standard-responses';
import { JobList } from './job-list';

describe('JobList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobList],
      providers: [provideRouter([])],
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
        startDate: '1970-01-01',
        endDate: '1970-01-02'
      },
      {
        jobId: 2,
        jobTitle: 'GPD',
        employerName: 'The Sky',
        filledPositions: 2,
        numberOfPositions: 2,
        startDate: '1970-01-03',
        endDate: '1970-01-04'
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
});
