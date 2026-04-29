import { Component, input, inject, signal, EventEmitter, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DisplayJob } from '../../poco/job';
import { DragonHttpClient } from '../../httpClients/dragon-http-client';
import { Dragon } from '../../poco/dragon';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-manage-job',
  imports: [ TableModule, DatePipe, ButtonModule ],
  templateUrl: './manage-job.html',
  styleUrl: './manage-job.scss',
})
export class ManageJob {
  lazyLoadingService = inject(DragonHttpClient);

  @Output() onClose: EventEmitter<any> = new EventEmitter();

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

  clearSelection() {
    this.onClose.emit(null);
  }
}
