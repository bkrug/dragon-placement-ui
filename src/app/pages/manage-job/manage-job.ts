import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { DragonTableType } from '../../../misc/enums';
import { mapJobToDisplayJob } from '../../../misc/transformers';
import { Job } from '../../../poco/models';
import { AssignedDragonTable } from '../../shared-components/assigned-dragon-table/assigned-dragon-table';
import { CandidateTable } from '../../shared-components/candidate-table/candidate-table';

@Component({
  selector: 'app-manage-job',
  imports: [DatePipe, AssignedDragonTable, CandidateTable, RouterLink],
  providers: [ AssignmentHttpClient ],
  templateUrl: './manage-job.html',
  styleUrl: './manage-job.scss',
})
export class ManageJob implements OnDestroy {
  private activatedRoute = inject(ActivatedRoute);
  private httpClient = inject(AssignmentHttpClient);

  assignedDragonTable = viewChild(AssignedDragonTable);
  candidateTable = viewChild(CandidateTable);
  DragonTableType = DragonTableType;

  ngOnDestroy(): void {
    this.httpClient.unsubscribe();
  }

  private routeParams = toSignal(this.activatedRoute.params, { initialValue: {} as Params });
  private jobId = computed(() => {
    const parsedInt = parseInt(this.routeParams()['jobId'], 10);
    console.log('parsedInt', parsedInt);
    return isNaN(parsedInt) ? null : parsedInt;
  });

  private jobResource = rxResource({
    params: () => this.jobId() ?? undefined,
    stream: ({ params }) => this.httpClient.getJob(params),
  });

  selectedJob = computed(() => 
    this.jobResource.value()
    ? mapJobToDisplayJob(this.jobResource.value()?.payload ?? new Job())
    : null);

  reloadDragonTables() {
    this.assignedDragonTable()?.forcePageLoad();
    this.candidateTable()?.forcePageLoad();
  }
}
