import { Component, input, InputSignal } from '@angular/core';
import { AbstractControl, FormGroup, FormControl } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-local-input-field',
  imports: [ ReactiveFormsModule, MessageModule ],
  templateUrl: './local-input-field.html',
  styleUrl: './local-input-field.scss',
})
export class LocalInputField {
  formGroup = input.required<FormGroup>();
  fieldControl = input.required<AbstractControl<string|null, string|null, any> | null>();
  id = input.required<string>();
  fieldName = input.required<string>();
  label = input.required<string>();

  shouldDisplayError = () => {
    const fieldControl = this.fieldControl();
    return fieldControl === null ? false : fieldControl.invalid && (fieldControl.dirty || fieldControl.touched)
  };

  getErrors() {
    const field = this.fieldControl();
    if (field === null || field.errors === null)
      return [];
    const errors = field.errors;
    const keys = Object.keys(errors);
    return keys
      .map(key => { return {
        errorType: key,
        errorValue : JSON.stringify(errors[key])
      }});
  }  
}
