import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { JobInclusions } from '../../../poco/enums';
import { Dragon, DragonValidationFailures } from '../../../poco/models';
import { EntityFormBase } from '../../local-form/entity-form-base';
import { LocalCheckbox, LocalNumberField, LocalSelectField, LocalSubmitButton, LocalTextField, SelectListOption } from '../../local-form/local-fields';

@Component({
  selector: 'app-dragon-form',
  imports: [ ReactiveFormsModule, LocalTextField, LocalCheckbox, LocalNumberField, LocalSelectField, LocalSubmitButton ],
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
    if (this.entityId)
      this.httpClient.getDragonWithJobs(this.entityId, JobInclusions.None)
        .then(validatedResponse => {
          this.dragon.set(validatedResponse.payload);
          this.formGroup.set(this.getDragonFormGroup());
        });
  }

  skillLevels = [
    { value: null, display: 'Select Skill Level...' },
    { value: 'b',  display: 'Basic' },
    { value: 'm',  display: 'Medium' },
    { value: 'a',  display: 'Advanced' }
  ] as SelectListOption[];

  formGroup = signal(this.getDragonFormGroup());

  private getDragonFormGroup() {
    return new FormGroup({
      givenName: new FormControl(this.dragon().givenName, [ Validators.required ]),
      familyName: new FormControl(this.dragon().familyName),
      canBreathFire: new FormControl(this.dragon().canBreathFire),
      canTakePassengers: new FormControl(this.dragon().canTakePassengers),
      weightInKg: new FormControl(this.dragon().weightInKg),
      lengthInMeters: new FormControl(this.dragon().lengthInMeters),
      fightingSkills: new FormControl(this.dragon().fightingSkills)
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
      fightingSkills: values.fightingSkills || null
    } as Dragon;
    return this.entityId
      ? this.httpClient.putDragonForm(this.entityId, body)
      : this.httpClient.postDragonForm(body);
  }

  protected override handleSubmissionSuccess(payload: Dragon) {
    this.entityId = payload.dragonId;
    this.dragon.set(payload);
    this.formGroup.set(this.getDragonFormGroup());
  }
}
