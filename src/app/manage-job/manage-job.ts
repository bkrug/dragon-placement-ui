import { Component, input } from '@angular/core';
import { DisplayJob } from '../../poco/job';

@Component({
  selector: 'app-manage-job',
  imports: [],
  templateUrl: './manage-job.html',
  styleUrl: './manage-job.scss',
})
export class ManageJob {
  selectedJob = input<DisplayJob | null>();
}
