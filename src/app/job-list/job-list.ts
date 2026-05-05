import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AssignmentHttpClient } from '../../httpClients/assignment-http-client';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { DisplayJob } from '../../poco/models';
import { ManageJob } from '../manage-job/manage-job';
import { mapJobToDisplayJob } from '../../transformers';
import { PAGE_SIZE } from '../../global-consts';

@Component({
  selector: 'app-job-list',
  imports: [ButtonModule, TableModule, ManageJob, DatePipe],
  templateUrl: './job-list.html',
  styleUrl: './job-list.scss',
})
export class JobList {
  lazyLoadingService = inject(AssignmentHttpClient);

  someDate = Date.now();

  jobs = signal<DisplayJob[]>([]);
  selectedJob = signal<DisplayJob | null>(null);
  totalRecords = signal(0);
  readonly pageSize = PAGE_SIZE;

  onPageChange(event: TableLazyLoadEvent) {
    const offset = event.first || 0;
    this.lazyLoadingService
      .getOnePageOfJobs(offset, this.pageSize)
      .then(pagedData => {
        this.jobs.set(pagedData.data.map(mapJobToDisplayJob));
        this.totalRecords.set(pagedData.totalRecords);
      });
  }
}
