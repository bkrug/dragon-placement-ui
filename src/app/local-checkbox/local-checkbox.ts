import { Component, input } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-local-checkbox',
  imports: [ ReactiveFormsModule, MessageModule ],
  templateUrl: './local-checkbox.html',
  styleUrl: './local-checkbox.scss',
})
export class LocalCheckbox {
  formGroup = input.required<FormGroup>();
  fieldControl = input.required<AbstractControl<string|null, string|null, any> | null>();
  id = input.required<string>();
  fieldName = input.required<string>();
  label = input.required<string>();

  shouldDisplayError = () => {
    const fieldControl = this.fieldControl();
    return fieldControl === null ? false : fieldControl.invalid && (fieldControl.dirty || fieldControl.touched)
  };

  stringify = (obj1: any) => JSON.stringify(obj1);

  getErrors() {
    const field = this.fieldControl();
    if (field === null || field.errors === null)
      return [];
    const errors = field.errors;
    const keys = Object.keys(errors);
    return keys
      .map(key => { return {
        errorType: key,
        errorMsg: this.getErrorMsg(key, errors)
      }});
  }

  private getErrorMsg(errorType: string, validationErrors: ValidationErrors) {
    const errObj = validationErrors[errorType];
    switch (errorType) {
      case 'required':
        return 'required';
      case 'minlength':
        return `minimum length is ${errObj.requiredLength} but is ${errObj.actualLength}`;
      default:
        return JSON.stringify(errObj);
    }
  }
}
