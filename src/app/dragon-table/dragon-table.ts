import { Component, input, inject, signal, EventEmitter, Output, OnInit } from '@angular/core';
import { DisplayJob } from '../../poco/job';
import { DragonHttpClient } from '../../httpClients/dragon-http-client';
import { Dragon } from '../../poco/dragon';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dragon-table',
  imports: [ TableModule, ButtonModule ],
  templateUrl: './dragon-table.html',
  styleUrl: './dragon-table.scss',
})
export class DragonTable implements OnInit {
  lazyLoadingService = inject(DragonHttpClient);

  selectedJob = input<DisplayJob | null>();
  dragonTableType = input<string>();  // 1 = Assign, 2 = Unassign

  @Output() onDragonAssigned: EventEmitter<any> = new EventEmitter();
  @Output() onDragonUnassigned: EventEmitter<any> = new EventEmitter();

  dragons = signal<Dragon[]>([]);
  selectedDragon = signal<Dragon | null>(null);
  totalRecords = signal(0);
  first = input(0);
  readonly pageSize = 20;

  forcePageLoad() {
    this.onPageChange({ first: this.first() });    
  }

  ngOnInit(): void {
    this.forcePageLoad();
  }

  onPageChange(event: TableLazyLoadEvent) {
    if (this.selectedJob() === null)
      return;

    const offset = event.first || 0;
    const dragonPromise = this.dragonTableType() === '1'
      ? this.lazyLoadingService.getOnePageOfCandidates(this.selectedJob()!.jobId, offset, this.pageSize)
      : this.lazyLoadingService.getOnePageOfAssignees(this.selectedJob()!.jobId, offset, this.pageSize);
    dragonPromise
      .then(pagedData => {
        this.dragons.set(pagedData.data);
        this.totalRecords.set(pagedData.totalRecords);
      });
  }

  assignDragon(dragonId: number) {
    if (this.selectedJob() === null)
      return;

    this.lazyLoadingService.assignDragonToJob(dragonId, this.selectedJob()!.jobId)
      .then(validatedResponse => {
        if (validatedResponse.isSuccess) {
          this.forcePageLoad();
          this.onDragonAssigned.emit();
        }
        else {
          alert(validatedResponse.validationFailures.join(", "));
        }
      });
  }
  
  unassignDragon(dragonId: number) {
    if (this.selectedJob() === null)
      return;

    this.lazyLoadingService.unassignDragonToJob(dragonId, this.selectedJob()!.jobId)
      .then(validatedResponse => {
        if (validatedResponse.isSuccess) {
          this.forcePageLoad();
          this.onDragonUnassigned.emit();
        }
        else {
          alert(validatedResponse.validationFailures.join(", "));
        }
      });
  }
}
