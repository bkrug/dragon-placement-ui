import { Component, inject, signal } from '@angular/core';
import { JobsHttpClient } from '../JobsHttpClient';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DisplayJob } from '../../poco/job';
import PagedData from '../../poco/pagedData';
import { ManageJob } from '../manage-job/manage-job';

@Component({
  selector: 'app-job-list',
  imports: [ButtonModule, PopoverModule, TableModule, TagModule, ManageJob],
  templateUrl: './job-list.html',
  styleUrl: './job-list.scss',
})
export class JobList {
  lazyLoadingService = inject(JobsHttpClient);

  jobs = signal<DisplayJob[]>([]);
  selectedJob = signal<DisplayJob | null>(null);
  totalRecords = signal(0);
  readonly pageSize = 20;

  onPageChange(event: TableLazyLoadEvent) {
    const offset = event.first || 0;
    this.lazyLoadingService
      .getOnePage(offset, this.pageSize)
      .then(pagedData => {
        this.jobs.set(pagedData.data);
        this.totalRecords.set(pagedData.totalRecords);
      });
  }  
}
