import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { getDateFromDateTimeString } from '../../../misc/transformers';
import { JobCreateEdit } from '../../../poco/endpoint-request-bodies';
import { Job, SkillTag } from '../../../poco/models';
import { EntityFormBase } from '../../local-form/entity-form-base';
import { LocalNumberField, LocalStringDateField, LocalSubmitButton, LocalTagField, LocalTextField, TagOption } from '../../local-form/local-fields';

@Component({
  selector: 'app-job-form',
  imports: [ ReactiveFormsModule, LocalStringDateField, LocalNumberField, LocalTextField, LocalSubmitButton, LocalTagField ],
  templateUrl: './job-form.html',
  styleUrl: './job-form.scss',
})
export class JobForm extends EntityFormBase<Job> implements OnInit {
  httpClient = inject(AssignmentHttpClient);

  constructor() {
    super('jobId');
  }

  ngOnInit(): void {
    this.httpClient.getAllSkills()
      .then(pagedData => this.skillTags.set(pagedData.data.map(this.toTagOption)));
    if (this.entityId)
      this.httpClient.getJob(this.entityId)
        .then(validatedResponse => {
          this.formGroup.set(this.getFormGroup(validatedResponse.payload));
        });
  }

  toTagOption(skillTag: SkillTag) { return { value: skillTag.skillTagId, display: skillTag.skillName } as TagOption; }
  toSkillTagId(tagOption: TagOption) {
    //HACK: Despite the strict typing of typescript, testing reveals "tagOption" can be a number.
    return (typeof tagOption === 'number')
      ? tagOption as number
      : tagOption.value;
  }

  skillTags = signal([] as TagOption[]);

  getFormGroup(payload: Job) {
    return new FormGroup({
      jobTitle: new FormControl(payload.jobTitle, [ Validators.required ]),
      employerName: new FormControl(payload.employerName),
      numberOfPositions: new FormControl(payload.numberOfPositions, [ Validators.required ]),
      startDate: new FormControl<string | null>(this.entityId ? getDateFromDateTimeString(payload.startDate) : null),
      endDate: new FormControl<string | null>(this.entityId ? getDateFromDateTimeString(payload.endDate) : null),
      skillTags: new FormControl(payload.skillTags.map(this.toTagOption))
    })
  }

  formGroup = signal(this.getFormGroup(new Job()));

  protected override makeSubmissionRequest() {
    const values = this.formGroup().value;
    const body = {
      jobTitle: values.jobTitle!,
      employerName: values.employerName || '',
      numberOfPositions: values.numberOfPositions!,
      startDate: values.startDate,
      endDate: values.endDate,
      skillTagIds: values.skillTags?.map(this.toSkillTagId) || []
    } as JobCreateEdit;
    return this.entityId
      ? this.httpClient.putJobForm(this.entityId, body)
      : this.httpClient.postJobForm(body);
  }

  protected override handleSubmissionSuccess(payload: Job) {
    this.entityId = payload.jobId;
  }
}
