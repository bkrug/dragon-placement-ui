import { Component, EventEmitter, inject, input, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PAGE_SIZE } from '../../../global-consts';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { DisplayJob, Dragon } from '../../../poco/models';
import { ValidatedResponse } from '../../../poco/standard-responses';

@Component({
  selector: 'app-assigned-dragon-table',
  imports: [TableModule, ButtonModule, RouterLink],
  templateUrl: './assigned-dragon-table.html',
  styleUrl: './assigned-dragon-table.scss',
})
export class AssignedDragonTable implements OnInit, OnDestroy {
  httpClient = inject(AssignmentHttpClient);

  selectedJob = input<DisplayJob | null>();

  //TODO: Why not use output() here instead of @Output()?
  @Output() unassignedDragon = new EventEmitter();

  dragons = signal<Dragon[]>([]);
  totalRecords = signal(0);
  first = input(0);
  readonly pageSize = PAGE_SIZE;

  ngOnInit(): void {
    this.forcePageLoad();
  }

  ngOnDestroy(): void {
    this.httpClient.unsubscribe();
  }

  forcePageLoad() {
    if (this.selectedJob() === null) return;
    this.httpClient.getOnePageOfAssignees(this.selectedJob()!.jobId, this.first(), this.pageSize)
      .subscribe(pagedData => {
        this.dragons.set(pagedData.data);
        this.totalRecords.set(pagedData.totalRecords);
      });
  }

  getSkillTagsDisplay(dragon: Dragon): string {
    const skillString = dragon.skillTags.map(st => st.skillName).join(', ');
    return skillString.length <= 50
      ? skillString
      : skillString.substring(0, 47) + '...';
  }

  unassignDragon(dragonId: number) {
    if (this.selectedJob() === null) return;
    this.httpClient.unassignDragonToJob(dragonId, this.selectedJob()!.jobId)
      .subscribe((validatedResponse: ValidatedResponse) => {
        if (validatedResponse.isSuccess) {
          this.unassignedDragon.emit();
        } else {
          alert(validatedResponse.validationFailures.join(', '));
        }
      });
  }
}
