import { Component, signal } from '@angular/core';
import { MessageModule } from 'primeng/message';
import { Dragon } from '../../poco/models';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { LocalCheckbox, LocalInputField, LocalNumberField, LocalSelectField, SelectListOption } from '../local-form/local-fields';

@Component({
  selector: 'app-dragon-form',
  imports: [ ReactiveFormsModule, MessageModule, LocalInputField, LocalCheckbox, LocalNumberField, LocalSelectField ],
  templateUrl: './dragon-form.html',
  styleUrl: './dragon-form.scss',
})
export class DragonForm {
  skillLevels = [
    { value: null, display: 'Select Skill Level...' },
    { value: 'b',  display: 'Basic' },
    { value: 'm',  display: 'Medium' },
    { value: 'a',  display: 'Advanced' }
  ] as SelectListOption[]

  dragon = signal(new Dragon());
  dragonFormGroup = new FormGroup({
    givenName: new FormControl(this.dragon().givenName, [ Validators.required, Validators.minLength(3) ]),
    familyName: new FormControl(this.dragon().familyName),
    canBreathFire: new FormControl(this.dragon().canBreathFire),
    canTakePassengers: new FormControl(this.dragon().canTakePassengers),
    weightInKg: new FormControl(this.dragon().weightInKg),
    lengthInMeters: new FormControl(this.dragon().lengthInMeters),
    fightingSkills: new FormControl(this.dragon().fightingSkills)
  })

  onSubmit() {
    console.log(this.dragonFormGroup.value);
  }
}
