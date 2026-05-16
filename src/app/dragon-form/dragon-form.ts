import { Component, signal, inject } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { Dragon } from '../../poco/models';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { LocalCheckbox, LocalInputField, LocalNumberField, LocalSelectField, SelectListOption } from '../local-form/local-fields';
import { AssignmentHttpClient } from '../../httpClients/assignment-http-client';
import { Effect } from 'effect';
import { ValidatedForm } from '../../poco/standard-responses';

@Component({
  selector: 'app-dragon-form',
  imports: [ ReactiveFormsModule, MessageModule, LocalInputField, LocalCheckbox, LocalNumberField, LocalSelectField ],
  templateUrl: './dragon-form.html',
  styleUrl: './dragon-form.scss',
})
export class DragonForm {
  httpClient = inject(AssignmentHttpClient);

  skillLevels = [
    { value: null, display: 'Select Skill Level...' },
    { value: 'b',  display: 'Basic' },
    { value: 'm',  display: 'Medium' },
    { value: 'a',  display: 'Advanced' }
  ] as SelectListOption[]

  dragon = signal(new Dragon());
  dragonFormGroup = new FormGroup({
    givenName: new FormControl(this.dragon().givenName, [ Validators.required ]),
    familyName: new FormControl(this.dragon().familyName),
    canBreathFire: new FormControl(this.dragon().canBreathFire),
    canTakePassengers: new FormControl(this.dragon().canTakePassengers),
    weightInKg: new FormControl(this.dragon().weightInKg),
    lengthInMeters: new FormControl(this.dragon().lengthInMeters),
    fightingSkills: new FormControl(this.dragon().fightingSkills)
  });

  onSubmit() {
    if (this.dragonFormGroup.valid) {
      const dragonFromForm = this.dragonFormGroup.value;
      const requestBody = {
        givenName: dragonFromForm.givenName!,
        familyName: dragonFromForm.familyName || null,
        canBreathFire: dragonFromForm.canBreathFire === true,
        canTakePassengers: dragonFromForm.canTakePassengers === true,
        weightInKg: dragonFromForm.weightInKg || null,
        lengthInMeters: dragonFromForm.lengthInMeters || null,
        fightingSkills: dragonFromForm.fightingSkills || null
      } as Dragon;
      const response = this.httpClient.postDragonForm(requestBody)
        .then(result =>
          Effect.runPromise(Effect.match(result, {
            onSuccess: _ => this.dragonFormGroup.reset(),
            onFailure: failureResponse => applyServerSideValidations(failureResponse, this.dragonFormGroup)
          }))
        );
    }
  }
}

function applyServerSideValidations<T extends object>(failures: ValidatedForm<T>, formGroup: FormGroup<any>) {
  const vFail = failures.validationFailures;
  const keys = Object.keys(vFail);
  keys.forEach((key: string) => {
    const failMsg = (vFail as any)[key] as string;
    failMsg && formGroup.get(key)?.setErrors({ 'server-side': failMsg });
  });
}
