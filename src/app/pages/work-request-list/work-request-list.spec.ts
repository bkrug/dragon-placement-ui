import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { WorkRequestClient } from '../../../httpClients/work-request-http-client';
import { WorkRequestStatus } from '../../../misc/enums';
import { WorkRequest } from '../../../poco/models';
import { PagedData } from '../../../poco/standard-responses';
import { WorkRequestList } from './work-request-list';

describe('WorkRequestList', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkRequestList],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('Data coming from the http client should be displayed in work request list data table.', async () => {
    const payloadData = [
      {
        workRequestId: 1,
        customerId: 1,
        name: 'Dragon Wrangling',
        description: 'Wrangle dragons',
        workRequestStatus: WorkRequestStatus.Draft,
        estimatedStartDate: '1970-01-01',
        estimatedEndDate: '1970-01-02',
        estimatedWorkforceSize: 3,
        customer: { customerId: 1, name: 'The Ocean' }
      },
      {
        workRequestId: 2,
        customerId: 2,
        name: 'Egg Sitting',
        description: 'Sit with eggs',
        workRequestStatus: WorkRequestStatus.Approved,
        estimatedStartDate: '1970-01-03',
        estimatedEndDate: '1970-01-04',
        estimatedWorkforceSize: 2,
        customer: { customerId: 2, name: 'The Sky' }
      }
    ];
    const mockHttpClient = new WorkRequestClient();
    mockHttpClient.getOnePageOfWorkRequests = (offset: number, limit: number) => {
      return of({
        offset: offset,
        limit: limit,
        totalRecords: 2,
        data: payloadData
      } as PagedData<WorkRequest>);
    };

    TestBed.configureTestingModule({
      providers: [{ provide: WorkRequestClient, useValue: mockHttpClient }]
    });

    //Act
    const fixture = TestBed.createComponent(WorkRequestList);
    const component = fixture.componentInstance;
    await fixture.whenStable();

    //Assert
    expect(component).toBeTruthy();
    const workRequestList: HTMLElement = fixture.nativeElement;
    const htmlTableRows = workRequestList.querySelectorAll('tr');
    const headerRowCount = 1;
    expect(htmlTableRows.length).toBe(headerRowCount + payloadData.length);
    expect(htmlTableRows[1].cells[1].textContent).toBe(payloadData[0].name);
    expect(htmlTableRows[2].cells[1].textContent).toBe(payloadData[1].name);
  });
});
