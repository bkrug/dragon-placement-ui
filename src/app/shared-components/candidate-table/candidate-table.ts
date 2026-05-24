import { Component, EventEmitter, inject, input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { PAGE_SIZE } from '../../../global-consts';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { DisplayJob, Dragon } from '../../../poco/models';
import { globalFightingSkillOptions } from '../../../skillLevels';
import { SelectListOption } from '../../local-form/local-fields';

@Component({
  selector: 'app-candidate-table',
  imports: [ TableModule, ButtonModule, SelectModule, FormsModule, MultiSelectModule ],
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

  skillTagOptions = signal([] as SelectListOption[]);
  skillTagFilter = signal([] as string[]);

  fightingSkillOptions = signal(globalFightingSkillOptions);
  fightingSkillFilter = signal(null as string | null);

  ngOnInit(): void {
    this.forcePageLoad();
    this.httpClient.getAllSkills()
      .then(pageData => {
        const options = pageData.data.map(d => (
          { display: d.skillName, value: d.skillTagId.toString() } as SelectListOption
        ));
        this.skillTagOptions.set(options);
      })
  }

  clearFilter() {
    this.skillTagFilter.set([]);
    this.fightingSkillFilter.set(null);
    this.forcePageLoad();
  }

  forcePageLoad() {
    this.onPageChange({ first: this.first() });
  }

  onPageChange(event: TableLazyLoadEvent) {
    if (this.selectedJob() === null)
      return;

    const offset = event.first || 0;
    const skillTagIds = this.skillTagFilter().map(f => parseInt(f));
    this.httpClient.getOnePageOfCandidates(this.selectedJob()!.jobId, skillTagIds, this.fightingSkillFilter(), offset, this.pageSize)
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
