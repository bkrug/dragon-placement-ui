import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { Job, JobValidationFailures } from '../../../poco/models';
import { getDateFromUnixSeconds, getUnixSeconds } from '../../../transformers';
import { EntityFormBase } from '../../local-form/entity-form-base';
import { LocalDateField, LocalNumberField, LocalSubmitButton, LocalTextField } from '../../local-form/local-fields';

@Component({
  selector: 'app-job-form',
  imports: [ ReactiveFormsModule, LocalDateField, LocalNumberField, LocalTextField, LocalSubmitButton ],
  templateUrl: './job-form.html',
  styleUrl: './job-form.scss',
})
export class JobForm extends EntityFormBase<Job, JobValidationFailures> implements OnInit {
  httpClient = inject(AssignmentHttpClient);
  job = signal(new Job());

  constructor() {
    super('jobId');
  }

  ngOnInit(): void {
    if (this.entityId)
      this.httpClient.getJob(this.entityId)
        .then(validatedResponse => {
          this.job.set(validatedResponse.payload);
          this.formGroup.set(this.getJobFormGroup());
        });
  }

  formGroup = signal(this.getJobFormGroup());

  private getJobFormGroup() {
    return new FormGroup({
      jobTitle: new FormControl(this.job().jobTitle, [ Validators.required ]),
      employerName: new FormControl(this.job().employerName),
      numberOfPositions: new FormControl(this.job().numberOfPositions, [ Validators.required ]),
      startDate: new FormControl(this.entityId ? getDateFromUnixSeconds(this.job().startDateUnix) : null),
      endDate: new FormControl(this.entityId ? getDateFromUnixSeconds(this.job().endDateUnix) : null),
    });
  }

  protected override makeSubmissionRequest() {
    const values = this.formGroup().value;
    const body = {
      jobTitle: values.jobTitle!,
      employerName: values.employerName || '',
      numberOfPositions: values.numberOfPositions!,
      startDateUnix: getUnixSeconds(values.startDate),
      endDateUnix: getUnixSeconds(values.endDate),
    } as Job;
    return this.entityId
      ? this.httpClient.putJobForm(this.entityId, body)
      : this.httpClient.postJobForm(body);
  }

  protected override handleSubmissionSuccess(payload: Job) {
    this.entityId = payload.jobId;
    this.job.set(payload);
    this.formGroup.set(this.getJobFormGroup());
  }
}
