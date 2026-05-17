import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Effect } from 'effect';
import { MessageModule } from 'primeng/message';
import { AssignmentHttpClient } from '../../httpClients/assignment-http-client';
import { JobInclusions } from '../../poco/enums';
import { Dragon } from '../../poco/models';
import { LocalCheckbox, LocalNumberField, LocalSelectField, LocalTextField, SelectListOption, applyServerSideValidations } from '../local-form/local-fields';

@Component({
  selector: 'app-dragon-form',
  imports: [ ReactiveFormsModule, MessageModule, LocalTextField, LocalCheckbox, LocalNumberField, LocalSelectField ],
  templateUrl: './dragon-form.html',
  styleUrl: './dragon-form.scss',
})
export class DragonForm implements OnInit {
  httpClient = inject(AssignmentHttpClient);
  private activatedRoute = inject(ActivatedRoute);
  private dragonId: number | null = null;
  dragon = signal(new Dragon());

  constructor() {
    this.activatedRoute.params.subscribe((params) => {
      this.dragonId = params['dragonId'] || null;
    });
  }

  ngOnInit(): void {
    if (this.dragonId)
      this.httpClient.getDragonWithJobs(this.dragonId, JobInclusions.None)
        .then(validatedResponse => {
          this.dragon.set(validatedResponse.payload);
          this.dragonFormGroup.set(this.getDragonFormGroup());
        });
  }

  skillLevels = [
    { value: null, display: 'Select Skill Level...' },
    { value: 'b',  display: 'Basic' },
    { value: 'm',  display: 'Medium' },
    { value: 'a',  display: 'Advanced' }
  ] as SelectListOption[]

  dragonFormGroup = signal(this.getDragonFormGroup());

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

  onSubmit() {
    if (this.dragonFormGroup().valid) {
      const dragonFromForm = this.dragonFormGroup().value;
      const requestBody = {
        givenName: dragonFromForm.givenName!,
        familyName: dragonFromForm.familyName || null,
        canBreathFire: dragonFromForm.canBreathFire === true,
        canTakePassengers: dragonFromForm.canTakePassengers === true,
        weightInKg: dragonFromForm.weightInKg || null,
        lengthInMeters: dragonFromForm.lengthInMeters || null,
        fightingSkills: dragonFromForm.fightingSkills || null
      } as Dragon;
      const httpResponse = this.dragonId
        ? this.httpClient.putDragonForm(this.dragonId, requestBody)
        : this.httpClient.postDragonForm(requestBody);
      httpResponse.then(result =>
        Effect.runPromise(Effect.match(result, {
          onSuccess: successResponse => {
            this.dragonId = successResponse.payload.dragonId;
            this.dragon.set(successResponse.payload);
            this.dragonFormGroup.set(this.getDragonFormGroup());
          },
          onFailure: failureResponse => failureResponse.isInternalError
            ? alert('failed communication with the remote server')
            : applyServerSideValidations(failureResponse, this.dragonFormGroup())
        }))
      );
    }
  }
}


