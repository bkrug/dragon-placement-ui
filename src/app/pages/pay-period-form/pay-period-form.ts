import { DecimalPipe } from '@angular/common';
import { Component, inject, input, OnChanges, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Temporal } from '@js-temporal/polyfill';
import { Effect } from 'effect';
import { TableModule } from 'primeng/table';
import { HoursWorkedClient } from '../../../httpClients/hours-worked-http-client';
import { getDateFromDateTimeString, getTimeFromDateTimeString } from '../../../misc/transformers';
import { PayPeriodCreateEdit, PayPeriodView } from '../../../poco/endpoint-request-bodies';
import { PayPeriod } from '../../../poco/models';
import { ValidatedForm, ValidatedPayload } from '../../../poco/standard-responses';
import { PayPeriodValidationFailuresNew } from '../../../poco/validation-failures';
import { EntityFormBase } from '../../local-form/entity-form-base';
import { getErrorsFromControl, LocalFieldErrors, LocalStringDateField, LocalStringTimeField, LocalSubmitButton } from '../../local-form/local-fields';

@Component({
  selector: 'app-pay-period-form',
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    TableModule,
    LocalStringDateField,
    LocalStringTimeField,
    LocalFieldErrors,
    LocalSubmitButton],
  templateUrl: './pay-period-form.html',
  styleUrl: './pay-period-form.scss',
})
export class PayPeriodForm extends EntityFormBase<PayPeriod, PayPeriodValidationFailuresNew> implements OnInit, OnChanges {
  httpClient = inject(HoursWorkedClient);
  private route = inject(ActivatedRoute);

  dataFromParentComponent = input<PayPeriod>();

  dragonName = signal('');
  assignmentDescription = signal('');
  minDate = signal('');
  maxDate = signal('');

  formGroup = signal(this.createFormGroup(new PayPeriodView()));

  hoursWorkedRows = signal<FormGroup[]>([]);

  get hoursWorkedArray() {
    return this.formGroup().get('hoursWorked') as FormArray;
  }

  constructor() {
    super('payPeriodId');
    this.route.params.subscribe(params => {
      this.entityId = params['payPeriodId'] || 0;
    });
    //See comment on hasFieldValidationErrors()
    this.overrideInvalidForm.set(true);
  }

  ngOnInit(): void {
    if (this.entityId) {
      this.httpClient.getPayPeriod(this.entityId)
        .then(r => this.initializeForm(r.payload));
    }
  }

  ngOnChanges() {
    const pp = this.dataFromParentComponent();
    if (pp) {
      this.initializeForm(Object.assign(new PayPeriodView(), {
        assignmentId: pp.assignmentId,
        startDate: getDateFromDateTimeString(pp.startDate),
        endDate: getDateFromDateTimeString(pp.endDate)
      }));
    }
  }

  private initializeForm(pp: PayPeriodView) {
    this.formGroup.set(this.createFormGroup(pp));
    this.hoursWorkedRows.set(this.cloneHoursWorkedArray());
    this.dragonName.set(pp.dragonName);
    this.assignmentDescription.set(pp.assignmentDescription);
    this.minDate.set(pp.startDate);
    this.maxDate.set(pp.endDate);
  }

  private createFormGroup(existingRecord: PayPeriodView) {
    return new FormGroup({
      assignmentId: new FormControl<number>(existingRecord.assignmentId),
      startDate: new FormControl<string | null>(existingRecord.startDate, [Validators.required]),
      endDate: new FormControl<string | null>(existingRecord.endDate, [Validators.required]),
      hoursWorked: new FormArray<FormGroup>(existingRecord.hoursWorked.map(hw => new FormGroup({
        workDate: new FormControl<string | null>(getDateFromDateTimeString(hw.startDateTime), [Validators.required]),
        startDateTime: new FormControl<string | null>(getTimeFromDateTimeString(hw.startDateTime), [Validators.required]),
        endDateTime: new FormControl<string | null>(getTimeFromDateTimeString(hw.endDateTime), [Validators.required]),
      }))),
    });
  }

  addRow() {
    const row = new FormGroup({
      workDate: new FormControl<string | null>(null, [Validators.required]),
      startDateTime: new FormControl<string | null>(null, [Validators.required]),
      endDateTime: new FormControl<string | null>(null, [Validators.required]),
    });
    this.hoursWorkedArray.push(row);
    this.hoursWorkedRows.set(this.cloneHoursWorkedArray());
  }

  removeRow(index: number) {
    this.hoursWorkedArray.removeAt(index);
    this.hoursWorkedRows.set(this.cloneHoursWorkedArray());
  }

  private cloneHoursWorkedArray(): FormGroup<any>[] {
    const toDateTime = (fg: FormGroup): Temporal.PlainDateTime | null => {
      const date = fg.get('workDate')?.value;
      const time = fg.get('startDateTime')?.value;
      return date && time
        ? Temporal.PlainDateTime.from(date + 'T' + time)
        : null;
    };
    const maxDate = Temporal.PlainDateTime.from('9999-12-31T23:59');
    return [...this.hoursWorkedArray.controls as FormGroup[]]
      .sort((fg1, fg2) => {
        const dt1 = toDateTime(fg1) || maxDate;
        const dt2 = toDateTime(fg2) || maxDate;
        return Temporal.PlainDateTime.compare(dt1, dt2);
      });
  }

  isSubmitDisabled(): boolean {
    return this.isSubmitting() || this.hasFieldValidationErrors(this.formGroup());
  }

  //Some server-side validations are based on more than one field.
  //When the user fixes the error, the validation message isn't necessarily removed.
  //If the only remaining validation failures are on a FormGroup (an hours-worked-row)
  //and not on an individual field, then enable the submit button.
  private hasFieldValidationErrors(group: FormGroup | FormArray): boolean {
    return Object.values(group.controls).some(control => {
      if (control instanceof FormGroup || control instanceof FormArray)
        return this.hasFieldValidationErrors(control);
      if (control.errors)
        return Object.values(control.errors).length > 0;
      return false;
    });
  }

  //Since we are allowing submision of forms despite the existance of row-level validation failures,
  //remove those failures when the user clicks the submit button.
  private clearServerSideValidations(group: FormGroup | FormArray) {
    Object.values(group.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        control.updateValueAndValidity();
        this.clearServerSideValidations(control);
      }
    });
  }  

  getTotalHours(rowGroup: FormGroup): number {
    const start = rowGroup.get('startDateTime')?.value;
    const end = rowGroup.get('endDateTime')?.value;
    if (!start || !end) return 0;
    const startDT = Temporal.PlainDateTime.from('2000-01-01T' + start);
    const endTime = Temporal.PlainDateTime.from('2000-01-01T' + end);
    const endDT = Temporal.PlainDateTime.compare(endTime, startDT) > 0
      ? endTime
      : endTime.add({ days: 1 });
    return startDT.until(endDT, { largestUnit: 'hours' }).total('hours');
  }

  private buildBody(): PayPeriodCreateEdit {
    const fg = this.formGroup();
    return {
      assignmentId: fg.value.assignmentId!,
      startDate: fg.value.startDate!,
      endDate: fg.value.endDate!,
      submissionStatus: '',
      hoursWorked: this.hoursWorkedArray.controls.map(row => {
        const v = row.value;
        const workDate = Temporal.PlainDate.from(v.workDate);
        const startTime = Temporal.PlainTime.from(v.startDateTime!);
        const endTime = Temporal.PlainTime.from(v.endDateTime!);
        const startDT = workDate.toPlainDateTime(startTime);
        const endDT = Temporal.PlainTime.compare(endTime, startTime) > 0
          ? workDate.toPlainDateTime(endTime)
          : workDate.add({ days: 1 }).toPlainDateTime(endTime);
        return {
          startDateTime: startDT.toString({ smallestUnit: 'minute' }),
          endDateTime: endDT.toString({ smallestUnit: 'minute' }),
        };
      }),
    };
  }

  protected override async makeSubmissionRequest()
    : Promise<Effect.Effect<ValidatedPayload<PayPeriod>, ValidatedForm<PayPeriodValidationFailuresNew>, never>> {
    this.clearServerSideValidations(this.formGroup());
    const body = this.buildBody();
    return this.entityId
      ? this.httpClient.putPayPeriodForm(this.entityId, body)
      : this.httpClient.postPayPeriodForm(body);
  }

  protected override handleSubmissionSuccess(payload: PayPeriod) {
    this.entityId = payload.payPeriodId;
  }

  getRowErrors(index: number) {
    return getErrorsFromControl(this.hoursWorkedArray.at(index));
  }
}
