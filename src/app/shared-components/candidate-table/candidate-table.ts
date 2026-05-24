import { Component, EventEmitter, inject, input, OnInit, Output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { PAGE_SIZE } from '../../../global-consts';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { DisplayJob, Dragon } from '../../../poco/models';

@Component({
  selector: 'app-candidate-table',
  imports: [ TableModule, ButtonModule ],
  templateUrl: './candidate-table.html',
  styleUrl: './candidate-table.scss',
})
export class CandidateTable implements OnInit {
  httpClient = inject(AssignmentHttpClient);

  selectedJob = input<DisplayJob | null>();

  @Output() assignedDragon = new EventEmitter();

  dragons = signal<Dragon[]>([]);
  selectedDragon = signal<Dragon | null>(null);
  totalRecords = signal(0);
  first = input(0);
  readonly pageSize = PAGE_SIZE;

  ngOnInit(): void {
    this.forcePageLoad();
  }

  forcePageLoad() {
    this.onPageChange({ first: this.first() });
  }

  onPageChange(event: TableLazyLoadEvent) {
    if (this.selectedJob() === null)
      return;

    const offset = event.first || 0;
    this.httpClient.getOnePageOfCandidates(this.selectedJob()!.jobId, offset, this.pageSize)
      .then(pagedData => {
        this.dragons.set(pagedData.data);
        this.totalRecords.set(pagedData.totalRecords);
      });
  }

  assignDragon(dragonId: number) {
    if (this.selectedJob() === null)
      return;

    this.httpClient.assignDragonToJob(dragonId, this.selectedJob()!.jobId)
      .then(validatedResponse => {
        if (validatedResponse.isSuccess) {
          this.assignedDragon.emit();
        }
        else {
          alert(validatedResponse.validationFailures.join(', '));
        }
      });
  }
}
