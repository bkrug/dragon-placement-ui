import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal, viewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { DragonTableType } from '../../../poco/enums';
import { DisplayJob } from '../../../poco/models';
import { mapJobToDisplayJob } from '../../../transformers';
import { DragonTable } from '../../shared-components/dragon-table/dragon-table';

@Component({
  selector: 'app-manage-job',
  imports: [DatePipe, DragonTable],
  templateUrl: './manage-job.html',
  styleUrl: './manage-job.scss',
})
export class ManageJob implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private httpClient = inject(AssignmentHttpClient);

  dragonTables = viewChildren(DragonTable);
  selectedJob = signal<DisplayJob | null>(null);
  DragonTableType = DragonTableType;

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      const jobId = params['jobId'] || null;
      this.httpClient.getJob(jobId).then(validatedPayload => {
        this.selectedJob.set(mapJobToDisplayJob(validatedPayload.payload));
      });
    });    
  }

  reloadDragonTables() {
    this.dragonTables().forEach(element => {
      element.forcePageLoad();
    });
  }
}
