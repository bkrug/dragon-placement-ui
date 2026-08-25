import { DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { PAGE_SIZE } from '../../../global-consts';
import { WorkRequestClient } from '../../../httpClients/work-request-http-client';
import { WorkRequestStatus } from '../../../misc/enums';
import { WorkRequest } from '../../../poco/models';

@Component({
  selector: 'app-work-request-list',
  imports: [TableModule, DatePipe, RouterLink],
  templateUrl: './work-request-list.html',
  styleUrl: './work-request-list.scss',
})
export class WorkRequestList implements OnDestroy {
  httpClient = inject(WorkRequestClient);

  workRequests = signal<WorkRequest[]>([]);
  totalRecords = signal(0);
  readonly pageSize = PAGE_SIZE;

  readonly statusLabels: Record<number, string> = {
    [WorkRequestStatus.Unspecified]: 'Unspecified',
    [WorkRequestStatus.Draft]: 'Draft',
    [WorkRequestStatus.Approved]: 'Approved',
    [WorkRequestStatus.Completed]: 'Completed',
  };

  ngOnDestroy(): void {
    this.httpClient.unsubscribe();
  }

  onPageChange(event: TableLazyLoadEvent) {
    const offset = event.first || 0;
    this.httpClient
      .getOnePageOfWorkRequests(offset, this.pageSize)
      .subscribe(pagedData => {
        this.workRequests.set(pagedData.data);
        this.totalRecords.set(pagedData.totalRecords);
      });
  }
}
