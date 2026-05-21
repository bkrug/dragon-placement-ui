import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Effect } from 'effect';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { Job } from '../../../poco/models';
import { getDateFromUnixSeconds, getUnixSeconds } from '../../../transformers';
import { LocalDateField, LocalNumberField, LocalTextField, applyServerSideValidations } from '../../local-form/local-fields';

@Component({
  selector: 'app-job-form',
  imports: [ ReactiveFormsModule, MessageModule, LocalDateField, LocalNumberField, LocalTextField, ButtonModule ],
  templateUrl: './job-form.html',
  styleUrl: './job-form.scss',
})
export class JobForm implements OnInit {
  httpClient = inject(AssignmentHttpClient);
  private activatedRoute = inject(ActivatedRoute);
  private jobId: number | null = null;
  job = signal(new Job());

  constructor() {
    this.activatedRoute.params.subscribe((params) => {
      this.jobId = params['jobId'] || null;
    });
  }

  ngOnInit(): void {
    if (this.jobId)
      this.httpClient.getJob(this.jobId)
        .then(validatedResponse => {
          this.job.set(validatedResponse.payload);
          this.jobFormGroup.set(this.getJobFormGroup());
        });
  }

  jobFormGroup = signal(this.getJobFormGroup());

  private getJobFormGroup() {
    return new FormGroup({
      jobTitle: new FormControl(this.job().jobTitle, [ Validators.required ]),
      employerName: new FormControl(this.job().employerName),
      numberOfPositions: new FormControl(this.job().numberOfPositions, [ Validators.required ]),
      startDate: new FormControl(this.jobId ? getDateFromUnixSeconds(this.job().startDateUnix) : null),
      endDate: new FormControl(this.jobId ? getDateFromUnixSeconds(this.job().endDateUnix) : null),
    });
  }

  onSubmit() {
    if (this.jobFormGroup().valid) {
      const jobFromForm = this.jobFormGroup().value;
      const requestBody = {
        jobTitle: jobFromForm.jobTitle!,
        employerName: jobFromForm.employerName || '',
        numberOfPositions: jobFromForm.numberOfPositions!,
        startDateUnix: getUnixSeconds(jobFromForm.startDate),
        endDateUnix: getUnixSeconds(jobFromForm.endDate),
      } as Job;
      const httpResponse = this.jobId
        ? this.httpClient.putJobForm(this.jobId, requestBody)
        : this.httpClient.postJobForm(requestBody);
      httpResponse.then(result =>
        Effect.runPromise(Effect.match(result, {
          onSuccess: successResponse => {
            this.jobId = successResponse.payload.jobId;
            this.job.set(successResponse.payload);
            this.jobFormGroup.set(this.getJobFormGroup());
          },
          onFailure: failureResponse => failureResponse.isInternalError
            ? alert('failed communication with the remote server')
            : applyServerSideValidations(failureResponse, this.jobFormGroup())
        }))
      );
    }
  }
}
