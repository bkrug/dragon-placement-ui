import { Component, computed, Directive, input, signal } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { ValidatedForm } from '../../poco/standard-responses';
import { GridRowValidationFailures, ValidationFailures } from '../../poco/validation-failures';

export interface FieldError {
  errorType: string;
  errorMsg: string;
}

export interface SelectListOption {
  display: string;
  value: string | null;
}

export interface TagOption {
  display: string;
  value: number;
}

export function getErrorsFromControl(control: AbstractControl | null): FieldError[] {
  if (control === null || control.errors === null)
    return [];
  const errors = control.errors;
  return Object.keys(errors).map(key => ({
    errorType: key,
    errorMsg: getErrorMsg(key, errors)
  }));
}

function getErrorMsg(errorType: string, validationErrors: ValidationErrors): string {
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

export function applyServerSideValidations<T extends object>(failures: ValidatedForm<T>, formGroup: FormGroup) {
  const validationFailures = failures.validationFailures as ValidationFailures;
  if (validationFailures.fieldFailures)
    applyValidationFailures(validationFailures, formGroup);
  else
    applyValidationObject(failures.validationFailures as Record<string, unknown>, formGroup);
};

function applyValidationFailures(validationFailures: ValidationFailures, formGroup: FormGroup) {
  const entries = Object.entries(validationFailures.fieldFailures);
  entries.forEach(([fieldName, validationMessage]) => {
    if (validationMessage) {
      const control = formGroup.get(toCamelCase(fieldName));
      control?.setErrors({ 'server-side': validationMessage });
    }
  });
}

function toCamelCase(fieldName: string): string {
  return fieldName.length > 0
    ? fieldName[0].toLowerCase() + fieldName.slice(1)
    : '';
}

function applyValidationObject(objectValidations: Record<string, unknown>, formGroup: FormGroup) {
  const keys = Object.keys(objectValidations);
  keys.forEach((key: string) => {
    const propValue = objectValidations[key];
    const abstractControl = formGroup.get(key);
    if (typeof propValue === 'string' && propValue)
      abstractControl?.setErrors({ 'server-side': propValue });
    else if (Array.isArray(propValue) && abstractControl instanceof FormArray) {
      propValue.forEach((item) => {
        const rowValidations = item as GridRowValidationFailures;
        const rowGroup = abstractControl.at(rowValidations.index);
        if (rowValidations.rowValidationMessage)
          rowGroup.setErrors({ 'server-side': rowValidations.rowValidationMessage });
        if (rowGroup instanceof FormGroup)
          applyValidationObject(item as Record<string, unknown>, rowGroup);
      });
    }
  });
}

@Directive()
abstract class LocalFieldBase<T extends (boolean | string | number | Date | TagOption[])> {
  formGroup = input.required<FormGroup>();
  fieldName = input.required<string>();
  label = input.required<string>();

  abstract getFieldControl(): AbstractControl<T|null, T|null, string> | null;
  isInvalid(): boolean {
    return this.getFieldControl()?.valid === false;
  };

  shouldDisplayError() {
    const fieldControl = this.getFieldControl();
    return fieldControl === null ? false : fieldControl.invalid && (fieldControl.dirty || fieldControl.touched)
  };

  getErrors(): FieldError[] {
    return getErrorsFromControl(this.getFieldControl());
  }
}

@Component({
  selector: 'app-local-field-errors',
  imports: [MessageModule],
  template: `
    @if (shouldDisplay()) {
      @for (error of errors(); track error.errorType) {
        <p-message severity="error" size="small" variant="simple">
          {{ error.errorMsg }}
        </p-message>
      }
    }
  `
})
export class LocalFieldErrors {
  errors = input.required<FieldError[]>();
  shouldDisplay = input.required<boolean>();
}

@Component({
  selector: 'app-local-text-field',
  imports: [ ReactiveFormsModule, InputTextModule, LocalFieldErrors ],
  templateUrl: './local-text-field.html',
  styleUrl: './local-field.scss',
})
export class LocalTextField extends LocalFieldBase<string> {
  inputType = signal('text');

  fieldControl = input.required<AbstractControl<string|null, string|null, string> | null>();
  override getFieldControl() {
    return this.fieldControl();
  }
}

@Component({
  selector: 'app-local-number-field',
  imports: [ ReactiveFormsModule, InputNumberModule, LocalFieldErrors ],
  templateUrl: './local-number-field.html',
  styleUrl: './local-field.scss',
})
export class LocalNumberField extends LocalFieldBase<number> {
  inputType = signal('number');

  fieldControl = input.required<AbstractControl<number|null, number|null, string> | null>();
  override getFieldControl() {
    return this.fieldControl();
  }
}

@Component({
  selector: 'app-local-string-date-field',
  imports: [ ReactiveFormsModule, InputTextModule, LocalFieldErrors ],
  templateUrl: './local-string-date-field.html',
  styleUrl: './local-field.scss',
})
export class LocalStringDateField extends LocalFieldBase<string> {
  min = input<string | null>(null);
  max = input<string | null>(null);

  fieldControl = input.required<AbstractControl<string|null, string|null, string> | null>();
  override getFieldControl() {
    return this.fieldControl();
  }
}

@Component({
  selector: 'app-local-string-time-field',
  imports: [ ReactiveFormsModule, InputTextModule, LocalFieldErrors ],
  templateUrl: './local-string-time-field.html',
  styleUrl: './local-field.scss',
})
export class LocalStringTimeField extends LocalFieldBase<string> {
  fieldControl = input.required<AbstractControl<string|null, string|null, string> | null>();
  override getFieldControl() {
    return this.fieldControl();
  }
}

@Component({
  selector: 'app-local-checkbox',
  imports: [ ReactiveFormsModule, CheckboxModule, LocalFieldErrors ],
  templateUrl: './local-checkbox.html',
  styleUrl: './local-field.scss',
})
export class LocalCheckbox extends LocalFieldBase<boolean> {
  fieldControl = input.required<AbstractControl<boolean|null, boolean|null, string> | null>();
  override getFieldControl() {
    return this.fieldControl();
  }
}

@Component({
  selector: 'app-local-select-field',
  imports: [ ReactiveFormsModule, SelectModule, LocalFieldErrors ],
  templateUrl: './local-select-field.html',
  styleUrl: './local-field.scss',
})
export class LocalSelectField extends LocalFieldBase<string> {
  options = input.required<SelectListOption[]>();

  fieldControl = input.required<AbstractControl<string|null, string|null, string> | null>();
  override getFieldControl() {
    return this.fieldControl();
  }
}

@Component({
  selector: 'app-local-tag-field',
  imports: [ ReactiveFormsModule, AutoCompleteModule, LocalFieldErrors ],
  templateUrl: './local-tag-field.html',
  styleUrl: './local-field.scss',
})
export class LocalTagField extends LocalFieldBase<TagOption[]> {
  options = input.required<TagOption[]>();
  private filter = signal('');
  filteredOptions = computed(() => this.options().filter(opt => opt.display.toLowerCase().indexOf(this.filter().toLocaleLowerCase()) >= 0));

  search(event: AutoCompleteCompleteEvent) {
    this.filter.set(event.query);
  }

  fieldControl = input.required<AbstractControl<TagOption[] | null, TagOption[] | null, string> | null>();
  override getFieldControl() {
    return this.fieldControl();
  }
}

@Component({
  selector: 'app-local-submit-button',
  imports: [ButtonModule, MessageModule],
  template: `
    <p-button type="submit" [disabled]="isSubmitDisabled()" [label]="isSubmitting() ? 'Submitting...' : 'Submit'" />
    @if (showSaved()) {
      <p-message severity="success" size="small" variant="simple">Saved</p-message>
    }
    @if (submissionError() !== '') {
      <p-message severity="error" size="small" variant="simple">{{ submissionError() }}</p-message>
    }
  `
})
export class LocalSubmitButton {
  isSubmitDisabled = input.required<boolean>();
  isSubmitting = input.required<boolean>();
  showSaved = input.required<boolean>();
  submissionError = input.required<string>();
}