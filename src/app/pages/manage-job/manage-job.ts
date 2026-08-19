import { DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { DragonTableType } from '../../../misc/enums';
import { mapJobToDisplayJob } from '../../../misc/transformers';
import { DisplayJob } from '../../../poco/models';
import { AssignedDragonTable } from '../../shared-components/assigned-dragon-table/assigned-dragon-table';
import { CandidateTable } from '../../shared-components/candidate-table/candidate-table';

@Component({
  selector: 'app-manage-job',
  imports: [DatePipe, AssignedDragonTable, CandidateTable, RouterLink],
  templateUrl: './manage-job.html',
  styleUrl: './manage-job.scss',
})
export class ManageJob implements OnInit, OnDestroy {
  private activatedRoute = inject(ActivatedRoute);
  private httpClient = inject(AssignmentHttpClient);

  assignedDragonTable = viewChild(AssignedDragonTable);
  candidateTable = viewChild(CandidateTable);
  selectedJob = signal<DisplayJob | null>(null);
  DragonTableType = DragonTableType;

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      const jobId = params['jobId'] || null;
      this.httpClient.getJob(jobId).subscribe(validatedPayload => {
        this.selectedJob.set(mapJobToDisplayJob(validatedPayload.payload));
      });
    });
  }

  ngOnDestroy(): void {
    this.httpClient.unsubscribe();
  }

  reloadDragonTables() {
    this.assignedDragonTable()?.forcePageLoad();
    this.candidateTable()?.forcePageLoad();
  }
}
