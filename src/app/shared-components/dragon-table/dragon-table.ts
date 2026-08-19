import { Component, EventEmitter, inject, input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Observable } from 'rxjs';
import { PAGE_SIZE } from '../../../global-consts';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { DragonTableType } from '../../../misc/enums';
import { DisplayJob, Dragon } from '../../../poco/models';
import { PagedData, ValidatedResponse } from '../../../poco/standard-responses';

@Component({
  selector: 'app-dragon-table',
  imports: [ TableModule, ButtonModule, RouterLink ],
  templateUrl: './dragon-table.html',
  styleUrl: './dragon-table.scss',
})
export class DragonTable implements OnInit, OnDestroy {
  httpClient = inject(AssignmentHttpClient);

  selectedJob = input<DisplayJob | null>();
  dragonTableType = input<DragonTableType>();

  //TODO: Why not use output() here instead of @Output()?
  @Output() assignedDragon = new EventEmitter();
  @Output() unassignedDragon = new EventEmitter();

  dragons = signal<Dragon[]>([]);
  selectedDragon = signal<Dragon | null>(null);
  totalRecords = signal(0);
  first = input(0);
  readonly pageSize = PAGE_SIZE;
  DragonTableType = DragonTableType;

  ngOnInit(): void {
    this.forcePageLoad();
  }

  ngOnDestroy(): void {
    this.httpClient.unsubscribe();
  }

  forcePageLoad() {
    this.onPageChange({ first: this.first() });
  }

  onPageChange(event: TableLazyLoadEvent) {
    if (this.selectedJob() === null)
      return;

    const offset = event.first || 0;
    this.getPageOfDragons(offset)
      .subscribe(pagedData => {
        this.dragons.set(pagedData.data);
        this.totalRecords.set(pagedData.totalRecords);
      });
  }

  private getPageOfDragons(offset: number): Observable<PagedData<Dragon>> {
    switch (this.dragonTableType()) {
      case DragonTableType.AllDragons:
        return this.httpClient.getOnePageOfDragons(offset, this.pageSize);
      case DragonTableType.Candidates:
        return this.httpClient.getOnePageOfCandidates(this.selectedJob()!.jobId, [], null, offset, this.pageSize);
      default:
        return this.httpClient.getOnePageOfAssignees(this.selectedJob()!.jobId, offset, this.pageSize);
    }
  }

  assignDragon(dragonId: number) {
    this.executeDragonAction(
      dragonId,
      (id, jobId) => this.httpClient.assignDragonToJob(id, jobId),
      this.assignedDragon);
  }

  unassignDragon(dragonId: number) {
    this.executeDragonAction(
      dragonId,
      (id, jobId) => this.httpClient.unassignDragonToJob(id, jobId),
      this.unassignedDragon);
  }

  private executeDragonAction(
    dragonId: number,
    httpFunction: (dragonId: number, jobId: number) => Observable<ValidatedResponse>,
    eventToEmit: EventEmitter<any>
  ) {
    if (this.selectedJob() === null)
      return;

    httpFunction(dragonId, this.selectedJob()!.jobId)
      .subscribe(validatedResponse => {
        if (validatedResponse.isSuccess) {
          eventToEmit.emit();
        }
        else {
          alert(validatedResponse.validationFailures.join(', '));
        }
      });
  }
}
