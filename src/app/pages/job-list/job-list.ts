import { DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { PAGE_SIZE } from '../../../global-consts';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { JobInclusions } from '../../../misc/enums';
import { mapJobToDisplayJob } from '../../../misc/transformers';
import { DisplayJob } from '../../../poco/models';

@Component({
  selector: 'app-job-list',
  imports: [TableModule, DatePipe, RouterLink, SelectModule, FormsModule],
  templateUrl: './job-list.html',
  styleUrl: './job-list.scss',
})
export class JobList implements OnInit, OnDestroy {
  httpClient = inject(AssignmentHttpClient);

  jobs = signal<DisplayJob[]>([]);
  totalRecords = signal(0);
  readonly pageSize = PAGE_SIZE;

  readonly jobInclusionsOptions = [
    { display: 'Current & Future', value: JobInclusions.CurrentAndFuture },
    { display: 'Past', value: JobInclusions.Past },
    { display: 'All', value: JobInclusions.All },
  ];
  jobInclusionsFilter = signal<JobInclusions>(JobInclusions.CurrentAndFuture);

  private readonly localStorageKey = 'job-list:jobInclusions';

  ngOnInit() {
    const stored = localStorage.getItem(this.localStorageKey);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      if (this.jobInclusionsOptions.some(o => o.value === parsed)) {
        this.jobInclusionsFilter.set(parsed);
      }
    }
  }

  ngOnDestroy(): void {
    this.httpClient.unsubscribe();
  }

  onJobInclusionChange() {
    localStorage.setItem(this.localStorageKey, String(this.jobInclusionsFilter()));
    this.onPageChange({ first: 0 });
  }

  onPageChange(event: TableLazyLoadEvent) {
    const offset = event.first || 0;
    this.httpClient
      .getOnePageOfJobs(offset, this.pageSize, this.jobInclusionsFilter())
      .then(pagedData => {
        this.jobs.set(pagedData.data.map(mapJobToDisplayJob));
        this.totalRecords.set(pagedData.totalRecords);
      });
  }
}
