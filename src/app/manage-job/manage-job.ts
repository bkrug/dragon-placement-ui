import { Component, input, inject, signal, EventEmitter, Output, OnInit } from '@angular/core';
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
export class ManageJob implements OnInit {
  lazyLoadingService = inject(DragonHttpClient);

  @Output() onClose: EventEmitter<any> = new EventEmitter();

  selectedJob = input<DisplayJob | null>();

  dragons = signal<Dragon[]>([]);
  selectedDragon = signal<Dragon | null>(null);
  totalRecords = signal(0);
  first = input(0);
  readonly pageSize = 20;

  assigneeMessage = signal('No dragons assigned');
  readonly displayableAssignees = 10;

  ngOnInit() {
    if (this.selectedJob() === null)
      return;
    
    this.loadAssignees();
  }

  private loadAssignees() {
    this.lazyLoadingService
      .getOnePageOfAssignees(this.selectedJob()!.jobId, 0, this.displayableAssignees + 1)
      .then(pagedData => {
        const names = pagedData.data
          .map(dragon => dragon.familyName === null ? dragon.givenName : dragon.givenName + ' ' + dragon.familyName)
          .join(', ');
        switch (pagedData.data.length) {
          case 0:
            this.assigneeMessage.set('No dragons assigned');
            break;
          case this.displayableAssignees + 1:
            this.assigneeMessage.set(`First ${this.displayableAssignees}: ` + names);
            break;
          default:
            this.assigneeMessage.set(names);
        }
      });
  }

  onPageChange(event: TableLazyLoadEvent) {
    if (this.selectedJob() === null)
      return;

    const offset = event.first || 0;
    this.lazyLoadingService
      .getOnePageOfCandidates(this.selectedJob()!.jobId, offset, this.pageSize)
      .then(pagedData => {
        this.dragons.set(pagedData.data);
        this.totalRecords.set(pagedData.totalRecords);
      });
  }

  clearSelection() {
    this.onClose.emit(null);
  }

  assignDragon(dragonId: number) {
    if (this.selectedJob() === null)
      return;

    this.lazyLoadingService.assignDragonToJob(dragonId, this.selectedJob()!.jobId)
      .then(validatedResponse => {
        if (validatedResponse.isSuccess) {
          this.onPageChange({ first: this.first() });
          this.loadAssignees();
        }
        else {
          alert(validatedResponse.validationFailures.join(", "));
        }
      });
  }
}
