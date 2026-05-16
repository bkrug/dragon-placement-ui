import { Component, inject, signal } from '@angular/core';
import { form, required} from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { Dragon } from '../../poco/models';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { LocalInputField } from '../local-input-field/local-input-field';

interface SkillLevel { code: string | null, name: string };

@Component({
  selector: 'app-dragon-form',
  imports: [ ReactiveFormsModule, MessageModule, LocalInputField ], //FormsModule, ButtonModule, InputTextModule, InputNumberModule, CheckboxModule, SelectModule, MessageModule],
  templateUrl: './dragon-form.html',
  styleUrl: './dragon-form.scss',
})
export class DragonForm {
  dragon = signal(new Dragon());
  skillLevels = [
    { code: null, name: 'Select Skill Level...' },
    { code: 'b', name: 'Basic' },
    { code: 'm', name: 'Medium' },
    { code: 'a', name: 'Advanced' }
  ] as SkillLevel[]

  dragonFormGroup = new FormGroup({
    givenName: new FormControl(this.dragon().givenName, [ Validators.required ]),
    familyName: new FormControl(this.dragon().familyName, [ Validators.minLength(3) ]),
  })

  getErrors(fieldName: string) {
    const field = this.dragonFormGroup.get(fieldName);
    if (field === null)
      return [];
    const errors = field.errors;
    if (errors === null)
      return [];
    const keys = Object.keys(errors);
    return keys
      .map(key => { return { errorType: key, errorValue : JSON.stringify(errors[key]) }});
  }

  onSubmit() {
    console.log(this.dragonFormGroup.value);
    console.log(this.dragonFormGroup.valid);
  }

  // dragonForm = form(this.dragon, (fieldPath) => {
  //   required(fieldPath.givenName, {message: 'Given Name is required'});
  // });

  // onSubmitOld(event: Event) {
  //   console.log(this.dragon());
  //   console.log(this.dragonForm().valid());
  //   console.log(this.dragonForm().errorSummary());
  //   console.log(this.dragonForm.givenName().errors());
  //   console.log(this.dragonForm.givenName().invalid());
  //   console.log(this.dragonForm.givenName().touched());
  // }
}
