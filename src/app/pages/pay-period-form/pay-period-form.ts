import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { getDateStringFromUnixSeconds, getUnixSeconds, parseTimeToSeconds } from '../../../misc/transformers';
import { HoursWorkedCreateEdit, PayPeriodCreateEdit } from '../../../poco/endpointRequestBodies';
import { PayPeriod } from '../../../poco/models';
import { LocalStringDateField, LocalStringTimeField, LocalSubmitButton } from '../../local-form/local-fields';

const SECONDS_PER_DAY = 24 * 60 * 60;

@Component({
  selector: 'app-pay-period-form',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, TableModule, LocalStringDateField, LocalStringTimeField, LocalSubmitButton],
  templateUrl: './pay-period-form.html',
  styleUrl: './pay-period-form.scss',
})
export class PayPeriodForm {
  payPeriod = input.required<PayPeriod>();
  dragonId = input.required<number>();
  assignmentId = input.required<number>();

  minDate = computed(() => getDateStringFromUnixSeconds(this.payPeriod().startDateUnix));
  maxDate = computed(() => getDateStringFromUnixSeconds(this.payPeriod().endDateUnix));

  formGroup = signal(new FormGroup({
    dragonId: new FormControl<number>(0),
    assignmentId: new FormControl<number>(0),
    startDateUnix: new FormControl<number | null>(null, [Validators.required]),
    endDateUnix: new FormControl<number | null>(null, [Validators.required]),
    hoursWorked: new FormArray<FormGroup>([]),
  }));

  hoursWorkedRows = signal<FormGroup[]>([]);

  get hoursWorkedArray() {
    return this.formGroup().get('hoursWorked') as FormArray;
  }

  ngOnChanges() {
    const pp = this.payPeriod();
    this.formGroup().patchValue({
      dragonId: this.dragonId(),
      assignmentId: this.assignmentId(),
      startDateUnix: pp.startDateUnix,
      endDateUnix: pp.endDateUnix,
    });
    this.hoursWorkedArray.clear();
    this.hoursWorkedRows.set([]);
  }

  addRow() {
    const row = new FormGroup({
      workDateUnix: new FormControl<string | null>(null, [Validators.required]),
      startDateTimeUnix: new FormControl<string | null>(null, [Validators.required]),
      endDateTimeUnix: new FormControl<string | null>(null, [Validators.required]),
    });
    this.hoursWorkedArray.push(row);
    this.hoursWorkedRows.set(this.cloneHoursWorkedArray());
  }

  removeRow(index: number) {
    this.hoursWorkedArray.removeAt(index);
    this.hoursWorkedRows.set(this.cloneHoursWorkedArray());
  }

  private cloneHoursWorkedArray(): FormGroup<any>[] {
    return [...this.hoursWorkedArray.controls as FormGroup[]];
  }

  onSubmit() {
    const fg = this.formGroup();
    const body: PayPeriodCreateEdit = {
      assignmentId: fg.value.assignmentId!,
      dragonId: fg.value.dragonId!,
      startDateUnix: fg.value.startDateUnix!,
      endDateUnix: fg.value.endDateUnix!,
      submissionStatus: '',
      hoursWorked: this.hoursWorkedArray.controls.map(row => {
        const v = row.value;
        const workDateSecs = getUnixSeconds(v.workDateUnix);
        const startSecs = parseTimeToSeconds(v.startDateTimeUnix!);
        const endSecs = parseTimeToSeconds(v.endDateTimeUnix!);
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
    console.log(body);
  }

  getTotalHours(rowGroup: FormGroup): number {
    const start = rowGroup.get('startDateTimeUnix')?.value;
    const end = rowGroup.get('endDateTimeUnix')?.value;
    if (!start || !end) return 0;
    const startSecs = parseTimeToSeconds(start);
    const endSecs = parseTimeToSeconds(end);
    return endSecs > startSecs
      ? (endSecs - startSecs) / 3600
      : (endSecs + SECONDS_PER_DAY - startSecs) / 3600;
  }
}
