import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { JobInclusions } from '../../../poco/enums';
import { Dragon, DragonValidationFailures, SkillTag } from '../../../poco/models';
import { EntityFormBase } from '../../local-form/entity-form-base';
import { LocalCheckbox, LocalNumberField, LocalSelectField, LocalSubmitButton, LocalTagField, LocalTextField, SelectListOption, TagOption } from '../../local-form/local-fields';

@Component({
  selector: 'app-dragon-form',
  imports: [ ReactiveFormsModule, LocalTextField, LocalCheckbox, LocalNumberField, LocalSelectField, LocalSubmitButton, LocalTagField ],
  templateUrl: './dragon-form.html',
  styleUrl: './dragon-form.scss',
})
export class DragonForm extends EntityFormBase<Dragon, DragonValidationFailures> implements OnInit {
  httpClient = inject(AssignmentHttpClient);
  dragon = signal(new Dragon());

  constructor() {
    super('dragonId');
  }

  ngOnInit(): void {
    this.httpClient.getAllSkills()
      .then(pagedData => this.skillTags.set(pagedData.data.map(this.toTagOption)));
    if (this.entityId)
      this.httpClient.getDragonWithJobs(this.entityId, JobInclusions.None)
        .then(validatedResponse => {
          this.dragon.set(validatedResponse.payload);
          this.formGroup.set(this.createDragonFormGroup());
        });
  }

  toTagOption(skillTag: SkillTag) { return { value: skillTag.skillTagId, display: skillTag.skillName } as TagOption; }
  toSkillTag(tagOption: TagOption) { 
    //HACK: Despite the strict typing of typescript, testing reveals "tagOption" be a number.
    return (typeof tagOption === 'number')
      ? { skillTagId: tagOption, skillName: '' } as SkillTag
      : { skillTagId: tagOption.value, skillName: tagOption.display } as SkillTag;
  }

  skillLevels = [
    { value: null, display: 'Select Skill Level...' },
    { value: 'b',  display: 'Basic' },
    { value: 'm',  display: 'Medium' },
    { value: 'a',  display: 'Advanced' }
  ] as SelectListOption[];

  skillTags = signal([] as TagOption[]);

  formGroup = signal(this.createDragonFormGroup());

  private createDragonFormGroup() {
    return new FormGroup({
      givenName: new FormControl(this.dragon().givenName, [ Validators.required ]),
      familyName: new FormControl(this.dragon().familyName),
      canBreathFire: new FormControl(this.dragon().canBreathFire),
      canTakePassengers: new FormControl(this.dragon().canTakePassengers),
      weightInKg: new FormControl(this.dragon().weightInKg),
      lengthInMeters: new FormControl(this.dragon().lengthInMeters),
      fightingSkills: new FormControl(this.dragon().fightingSkills),
      skillTags: new FormControl(this.dragon().skillTags.map(this.toTagOption))
    });
  }

  protected override makeSubmissionRequest() {
    const values = this.formGroup().value;
    const body = {
      givenName: values.givenName!,
      familyName: values.familyName || null,
      canBreathFire: values.canBreathFire === true,
      canTakePassengers: values.canTakePassengers === true,
      weightInKg: values.weightInKg || null,
      lengthInMeters: values.lengthInMeters || null,
      fightingSkills: values.fightingSkills || null,
      skillTags: values.skillTags?.map(this.toSkillTag) || []
    } as Dragon;
    return this.entityId
      ? this.httpClient.putDragonForm(this.entityId, body)
      : this.httpClient.postDragonForm(body);
  }

  protected override handleSubmissionSuccess(payload: Dragon) {
    this.entityId = payload.dragonId;
    this.dragon.set(payload);
  }
}
