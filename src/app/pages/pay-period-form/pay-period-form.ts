import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Effect } from 'effect';
import { TableModule } from 'primeng/table';
import { HoursWorkedClient } from '../../../httpClients/hours-worked-http-client';
import { getDateStringFromUnixSeconds, getTimeStringFromUnixSeconds, getUnixSeconds, parseTimeToSeconds } from '../../../misc/transformers';
import { HoursWorkedCreateEdit, PayPeriodCreateEdit } from '../../../poco/endpointRequestBodies';
import { PayPeriod } from '../../../poco/models';
import { ValidatedForm, ValidatedPayload } from '../../../poco/standard-responses';
import { PayPeriodValidationFailures } from '../../../poco/validationFailures';
import { EntityFormBase } from '../../local-form/entity-form-base';
import { LocalStringDateField, LocalStringTimeField, LocalSubmitButton } from '../../local-form/local-fields';

const SECONDS_PER_DAY = 24 * 60 * 60;

@Component({
  selector: 'app-pay-period-form',
  imports: [
    ReactiveFormsModule,
    DatePipe, DecimalPipe,
    TableModule,
    LocalStringDateField,
    LocalStringTimeField,
    LocalSubmitButton],
  templateUrl: './pay-period-form.html',
  styleUrl: './pay-period-form.scss',
})
export class PayPeriodForm extends EntityFormBase<PayPeriod, PayPeriodValidationFailures> implements OnInit {
  httpClient = inject(HoursWorkedClient);
  private route = inject(ActivatedRoute);

  dataFromParentComponent = input<PayPeriod>();

  minDate = signal('');
  maxDate = signal('');

  formGroup = signal(this.createFormGroup(new PayPeriod()));

  hoursWorkedRows = signal<FormGroup[]>([]);

  get hoursWorkedArray() {
    return this.formGroup().get('hoursWorked') as FormArray;
  }

  constructor() {
    super('payPeriodId');
    this.route.params.subscribe(params => {
      this.entityId = params['payPeriodId'] || 0;
    });    
  }

  ngOnInit(): void {
    if (this.entityId) {
      this.httpClient.getPayPeriod(this.entityId)
        .then(r => this.initializeForm(r.payload));
    }
  }

  ngOnChanges() {
    const pp = this.dataFromParentComponent();
    if (pp)
      this.initializeForm(pp);
  }  

  private initializeForm(pp: PayPeriod) {
    this.formGroup.set(this.createFormGroup(pp));
    this.hoursWorkedRows.set(this.cloneHoursWorkedArray());
    this.minDate.set(getDateStringFromUnixSeconds(pp.startDateUnix));
    this.maxDate.set(getDateStringFromUnixSeconds(pp.endDateUnix));
  }

  private createFormGroup(existingRecord: PayPeriod) {
    return new FormGroup({
      dragonId: new FormControl<number>(existingRecord.dragonId),
      assignmentId: new FormControl<number>(existingRecord.assignmentId),
      startDateUnix: new FormControl<number | null>(existingRecord.startDateUnix, [Validators.required]),
      endDateUnix: new FormControl<number | null>(existingRecord.endDateUnix, [Validators.required]),
      hoursWorked: new FormArray<FormGroup>(existingRecord.hoursWorked.map(hw => new FormGroup({
        workDate: new FormControl<string | null>(getDateStringFromUnixSeconds(hw.startDateTimeUnix), [Validators.required]),
        startDateTime: new FormControl<string | null>(getTimeStringFromUnixSeconds(hw.startDateTimeUnix), [Validators.required]),
        endDateTime: new FormControl<string | null>(getTimeStringFromUnixSeconds(hw.endDateTimeUnix), [Validators.required]),
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
    const sortedGroup = [...this.hoursWorkedArray.controls as FormGroup[]]
      .sort((fg1, fg2) => {
        const startTime1 = getUnixSeconds(fg1.get('workDate')?.value || '')
          + parseTimeToSeconds(fg1.get('startDateTime')?.value || '');
        const startTime2 = getUnixSeconds(fg2.get('workDate')?.value || '')
          + parseTimeToSeconds(fg2.get('startDateTime')?.value || '');
        return startTime1 - startTime2;
      });
    return sortedGroup;
  }

  getTotalHours(rowGroup: FormGroup): number {
    const start = rowGroup.get('startDateTime')?.value;
    const end = rowGroup.get('endDateTime')?.value;
    if (!start || !end) return 0;
    const startSecs = parseTimeToSeconds(start);
    const endSecs = parseTimeToSeconds(end);
    return endSecs > startSecs
      ? (endSecs - startSecs) / 3600
      : (endSecs + SECONDS_PER_DAY - startSecs) / 3600;
  }  

  private buildBody(): PayPeriodCreateEdit {
    const fg = this.formGroup();
    return {
      assignmentId: fg.value.assignmentId!,
      dragonId: fg.value.dragonId!,
      startDateUnix: fg.value.startDateUnix!,
      endDateUnix: fg.value.endDateUnix!,
      submissionStatus: '',
      hoursWorked: this.hoursWorkedArray.controls.map(row => {
        const v = row.value;
        const workDateSecs = getUnixSeconds(v.workDate);
        const startSecs = parseTimeToSeconds(v.startDateTime!);
        const endSecs = parseTimeToSeconds(v.endDateTime!);
        return {
          assignmentId: fg.value.assignmentId!,
          dragonId: fg.value.dragonId!,
          startDateTimeUnix: workDateSecs + startSecs,
          endDateTimeUnix: endSecs > startSecs
            ? workDateSecs + endSecs
            : workDateSecs + SECONDS_PER_DAY + endSecs,
        } as HoursWorkedCreateEdit;
      }),
    };
  }

  protected override async makeSubmissionRequest(): Promise<Effect.Effect<ValidatedPayload<PayPeriod>, ValidatedForm<PayPeriodValidationFailures>, never>> {
    const body = this.buildBody();
    return this.entityId
      ? this.httpClient.putPayPeriodForm(this.entityId, body)
      : this.httpClient.postPayPeriodForm(body);
  }

  protected override handleSubmissionSuccess(payload: PayPeriod) {
    this.entityId = payload.payPeriodId;
  }
}
