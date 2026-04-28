import { Component, input, inject, signal } from '@angular/core';
import { DisplayJob } from '../../poco/job';
import { DragonHttpClient } from '../../httpClients/dragon-http-client';
import { Dragon } from '../../poco/dragon';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-manage-job',
  imports: [ TableModule ],
  templateUrl: './manage-job.html',
  styleUrl: './manage-job.scss',
})
export class ManageJob {
  lazyLoadingService = inject(DragonHttpClient);

  selectedJob = input<DisplayJob | null>();

  dragons = signal<Dragon[]>([]);
  selectedDragon = signal<Dragon | null>(null);
  totalRecords = signal(0);
  readonly pageSize = 20;

  onPageChange(event: TableLazyLoadEvent) {
    if (this.selectedJob() === null)
      return;

    const offset = event.first || 0;
    this.lazyLoadingService
      .getOnePage(this.selectedJob()!.jobId, offset, this.pageSize)
      .then(pagedData => {
        this.dragons.set(pagedData.data);
        this.totalRecords.set(pagedData.totalRecords);
      });
  }  
}
