import { Component, Directive, input } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ReactiveFormsModule } from '@angular/forms';

@Directive()
abstract class LocalFieldBase<T extends (boolean | string)> {
  formGroup = input.required<FormGroup>();
  id = input.required<string>();
  fieldName = input.required<string>();
  label = input.required<string>();

  abstract getFieldControl(): AbstractControl<T|null, T|null, any> | null;

  shouldDisplayError = () => {
    const fieldControl = this.getFieldControl();
    return fieldControl === null ? false : fieldControl.invalid && (fieldControl.dirty || fieldControl.touched)
  };

  stringify = (obj1: any) => JSON.stringify(obj1);

  getErrors() {
    const field = this.getFieldControl();
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

@Component({
  selector: 'app-local-input-field',
  imports: [ ReactiveFormsModule, MessageModule ],
  templateUrl: './local-input-field.html',
  styleUrl: './local-input-field.scss',
})
export class LocalInputField extends LocalFieldBase<string> {
  fieldControl = input.required<AbstractControl<string|null, string|null, any> | null>();

  override getFieldControl(): AbstractControl<string | null, string | null, any> | null {
    return this.fieldControl();
  }
}

@Component({
  selector: 'app-local-checkbox',
  imports: [ ReactiveFormsModule, MessageModule ],
  templateUrl: './local-checkbox.html',
  styleUrl: './local-checkbox.scss',
})
export class LocalCheckbox extends LocalFieldBase<boolean> {
  fieldControl = input.required<AbstractControl<boolean|null, boolean|null, any> | null>();

  override getFieldControl(): AbstractControl<boolean | null, boolean | null, any> | null {
    return this.fieldControl();
  }
}