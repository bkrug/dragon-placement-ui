import { Component, input, inject, signal, EventEmitter, Output, OnInit } from '@angular/core';
import { DisplayJob } from '../../poco/models';
import { ValidatedResponse } from '../../poco/validatedResponse';
import { AssignmentHttpClient } from '../../httpClients/assignment-http-client';
import { Dragon } from '../../poco/models';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DragonTableType } from '../../poco/enums';

@Component({
  selector: 'app-dragon-table',
  imports: [ TableModule, ButtonModule ],
  templateUrl: './dragon-table.html',
  styleUrl: './dragon-table.scss',
})
export class DragonTable implements OnInit {
  lazyLoadingService = inject(AssignmentHttpClient);

  selectedJob = input<DisplayJob | null>();
  dragonTableType = input<DragonTableType>();

  @Output() onDragonAssigned: EventEmitter<any> = new EventEmitter();
  @Output() onDragonUnassigned: EventEmitter<any> = new EventEmitter();

  dragons = signal<Dragon[]>([]);
  selectedDragon = signal<Dragon | null>(null);
  totalRecords = signal(0);
  first = input(0);
  readonly pageSize = 20;
  DragonTableType = DragonTableType;

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
    this.getPageOfDragons(offset)
      .then(pagedData => {
        this.dragons.set(pagedData.data);
        this.totalRecords.set(pagedData.totalRecords);
      });
  }

  private getPageOfDragons(offset: number) {
    switch (this.dragonTableType()) {
      case DragonTableType.AllDragons:
        return this.lazyLoadingService.getOnePageOfDragons(offset, this.pageSize);
      case DragonTableType.Assign:
        return this.lazyLoadingService.getOnePageOfCandidates(this.selectedJob()!.jobId, offset, this.pageSize);
      default:
        return this.lazyLoadingService.getOnePageOfAssignees(this.selectedJob()!.jobId, offset, this.pageSize);
    }
  }

  assignDragon(dragonId: number) {
    this.executeDragonAction(
      dragonId,
      this.lazyLoadingService.assignDragonToJob,
      this.onDragonAssigned);
  }
  
  unassignDragon(dragonId: number) {
    this.executeDragonAction(
      dragonId,
      this.lazyLoadingService.unassignDragonToJob,
      this.onDragonUnassigned);
  }

  private executeDragonAction(
    dragonId: number,
    httpFunction: (dragonId: number, jobId: number) => Promise<ValidatedResponse>,
    eventToEmit: EventEmitter<any>
  ) {
    if (this.selectedJob() === null)
      return;

    httpFunction(dragonId, this.selectedJob()!.jobId)
      .then(validatedResponse => {
        if (validatedResponse.isSuccess) {
          eventToEmit.emit();
        }
        else {
          alert(validatedResponse.validationFailures.join(", "));
        }
      });    
  }
}
