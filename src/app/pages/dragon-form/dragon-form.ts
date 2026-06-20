import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { JobInclusions } from '../../../misc/enums';
import { globalFightingSkillOptions } from '../../../misc/skillLevels';
import { DragonCreateEdit } from '../../../poco/endpoint-request-bodies';
import { Dragon, SkillTag } from '../../../poco/models';
import { DragonValidationFailures } from '../../../poco/validation-failures';
import { EntityFormBase } from '../../local-form/entity-form-base';
import { LocalNumberField, LocalSelectField, LocalSubmitButton, LocalTagField, LocalTextField, TagOption } from '../../local-form/local-fields';

@Component({
  selector: 'app-dragon-form',
  imports: [ ReactiveFormsModule, LocalTextField, LocalNumberField, LocalSelectField, LocalSubmitButton, LocalTagField ],
  templateUrl: './dragon-form.html',
  styleUrl: './dragon-form.scss',
})
export class DragonForm extends EntityFormBase<Dragon, DragonValidationFailures> implements OnInit {
  httpClient = inject(AssignmentHttpClient);

  constructor() {
    super('dragonId');
  }

  ngOnInit(): void {
    this.httpClient.getAllSkills()
      .then(pagedData => this.skillTags.set(pagedData.data.map(this.toTagOption)));
    if (this.entityId)
      this.httpClient.getDragonWithJobs(this.entityId, JobInclusions.None)
        .then(validatedResponse => {
          this.formGroup.set(this.createDragonFormGroup(validatedResponse.payload));
        });
  }

  toTagOption(skillTag: SkillTag) { return { value: skillTag.skillTagId, display: skillTag.skillName } as TagOption; }
  toSkillTagId(tagOption: TagOption) {
    //HACK: Despite the strict typing of typescript, testing reveals "tagOption" be a number.
    return (typeof tagOption === 'number')
      ? tagOption as number
      : tagOption.value;
  }

  skillLevels = globalFightingSkillOptions;

  skillTags = signal([] as TagOption[]);

  formGroup = signal(this.createDragonFormGroup(new Dragon()));

  private createDragonFormGroup(payload: Dragon) {
    return new FormGroup({
      givenName: new FormControl(payload.givenName, [ Validators.required ]),
      familyName: new FormControl(payload.familyName),
      weightInKg: new FormControl(payload.weightInKg),
      lengthInMeters: new FormControl(payload.lengthInMeters),
      fightingSkills: new FormControl(payload.fightingSkills),
      skillTags: new FormControl(payload.skillTags.map(this.toTagOption))
    });
  }

  protected override makeSubmissionRequest() {
    const values = this.formGroup().value;
    const body = {
      givenName: values.givenName!,
      familyName: values.familyName || null,
      weightInKg: values.weightInKg || null,
      lengthInMeters: values.lengthInMeters || null,
      fightingSkills: values.fightingSkills || null,
      skillTagIds: values.skillTags?.map(this.toSkillTagId) || []
    } as DragonCreateEdit;
    return this.entityId
      ? this.httpClient.putDragonForm(this.entityId, body)
      : this.httpClient.postDragonForm(body);
  }

  protected override handleSubmissionSuccess(payload: Dragon) {
    this.entityId = payload.dragonId;
  }
}
