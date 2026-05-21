import { Component, Directive, input, signal } from '@angular/core';
import { AbstractControl, FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { ValidatedForm } from '../../poco/standard-responses';

@Directive()
abstract class LocalFieldBase<T extends (boolean | string | number | Date)> {
  formGroup = input.required<FormGroup>();
  id = input.required<string>();
  fieldName = input.required<string>();
  label = input.required<string>();

  abstract getFieldControl(): AbstractControl<T|null, T|null, any> | null;
  isInvalid() {
    return this.getFieldControl()?.valid === false;
  };

  shouldDisplayError() {
    const fieldControl = this.getFieldControl();
    return fieldControl === null ? false : fieldControl.invalid && (fieldControl.dirty || fieldControl.touched)
  };

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
      case 'server-side':
        return errObj as string;
      case 'required':
        return 'required';
      case 'minlength':
        return `minimum length is ${errObj.requiredLength} instead of ${errObj.actualLength}`;
      default:
        return JSON.stringify(errObj);
    }
  }
}

export interface SelectListOption {
  display: string;
  value: string | null;
}

export function applyServerSideValidations<T extends object>(failures: ValidatedForm<T>, formGroup: FormGroup) {
  const vFail = failures.validationFailures;
  const keys = Object.keys(vFail);
  keys.forEach((key: string) => {
    const failMsg = (vFail as any)[key] as string;
    if (failMsg)
      formGroup.get(key)?.setErrors({ 'server-side': failMsg });
  });
};

@Component({
  selector: 'app-local-text-field',
  imports: [ ReactiveFormsModule, MessageModule, InputTextModule ],
  templateUrl: './local-text-field.html',
  styleUrl: './local-field.scss',
})
export class LocalTextField extends LocalFieldBase<string> {
  inputType = signal('text');

  fieldControl = input.required<AbstractControl<string|null, string|null, any> | null>();
  override getFieldControl() {
    return this.fieldControl();
  }
}

@Component({
  selector: 'app-local-number-field',
  imports: [ ReactiveFormsModule, MessageModule, InputNumberModule ],
  templateUrl: './local-number-field.html',
  styleUrl: './local-field.scss',
})
export class LocalNumberField extends LocalFieldBase<number> {
  inputType = signal('number');

  fieldControl = input.required<AbstractControl<number|null, number|null, any> | null>();
  override getFieldControl() {
    return this.fieldControl();
  }
}

//The generic used here is a string, because the input field requires a string in YYYY-MM-dd format.
@Component({
  selector: 'app-local-date-field',
  imports: [ ReactiveFormsModule, MessageModule, DatePickerModule ],
  templateUrl: './local-date-field.html',
  styleUrl: './local-field.scss',
})
export class LocalDateField extends LocalFieldBase<Date> {
  inputType = signal('date');

  fieldControl = input.required<AbstractControl<Date|null, Date|null, any> | null>();
  override getFieldControl() {
    return this.fieldControl();
  }
}

@Component({
  selector: 'app-local-checkbox',
  imports: [ ReactiveFormsModule, MessageModule, CheckboxModule ],
  templateUrl: './local-checkbox.html',
  styleUrl: './local-field.scss',
})
export class LocalCheckbox extends LocalFieldBase<boolean> {
  fieldControl = input.required<AbstractControl<boolean|null, boolean|null, any> | null>();
  override getFieldControl() {
    return this.fieldControl();
  }
}

@Component({
  selector: 'app-local-select-field',
  imports: [ ReactiveFormsModule, MessageModule, SelectModule ],
  templateUrl: './local-select-field.html',
  styleUrl: './local-field.scss',
})
export class LocalSelectField extends LocalFieldBase<string> {
  options = input.required<SelectListOption[]>();

  fieldControl = input.required<AbstractControl<string|null, string|null, any> | null>();
  override getFieldControl() {
    return this.fieldControl();
  }
}