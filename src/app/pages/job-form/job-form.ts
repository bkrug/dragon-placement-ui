import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { Job, JobValidationFailures, SkillTag } from '../../../poco/models';
import { getDateFromUnixSeconds, getUnixSeconds } from '../../../transformers';
import { EntityFormBase } from '../../local-form/entity-form-base';
import { LocalDateField, LocalNumberField, LocalSubmitButton, LocalTagField, LocalTextField, TagOption } from '../../local-form/local-fields';

@Component({
  selector: 'app-job-form',
  imports: [ ReactiveFormsModule, LocalDateField, LocalNumberField, LocalTextField, LocalSubmitButton, LocalTagField ],
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
    this.httpClient.getAllSkills()
      .then(pagedData => this.skillTags.set(pagedData.data.map(this.toTagOption)));
    if (this.entityId)
      this.httpClient.getJob(this.entityId)
        .then(validatedResponse => {
          this.job.set(validatedResponse.payload);
          this.formGroup.set(this.getJobFormGroup());
        });
  }

  toTagOption(skillTag: SkillTag) { return { value: skillTag.skillTagId, display: skillTag.skillName } as TagOption; }
  toSkillTag(tagOption: TagOption) {
    //HACK: Despite the strict typing of typescript, testing reveals "tagOption" can be a number.
    return (typeof tagOption === 'number')
      ? { skillTagId: tagOption, skillName: '' } as SkillTag
      : { skillTagId: tagOption.value, skillName: tagOption.display } as SkillTag;
  }

  skillTags = signal([] as TagOption[]);

  formGroup = signal(this.getJobFormGroup());

  private getJobFormGroup() {
    return new FormGroup({
      jobTitle: new FormControl(this.job().jobTitle, [ Validators.required ]),
      employerName: new FormControl(this.job().employerName),
      numberOfPositions: new FormControl(this.job().numberOfPositions, [ Validators.required ]),
      startDate: new FormControl(this.entityId ? getDateFromUnixSeconds(this.job().startDateUnix) : null),
      endDate: new FormControl(this.entityId ? getDateFromUnixSeconds(this.job().endDateUnix) : null),
      skillTags: new FormControl(this.job().skillTags.map(this.toTagOption))
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
      skillTags: values.skillTags?.map(this.toSkillTag) || []
    } as Job;
    return this.entityId
      ? this.httpClient.putJobForm(this.entityId, body)
      : this.httpClient.postJobForm(body);
  }

  protected override handleSubmissionSuccess(payload: Job) {
    this.entityId = payload.jobId;
    this.job.set(payload);
  }
}
