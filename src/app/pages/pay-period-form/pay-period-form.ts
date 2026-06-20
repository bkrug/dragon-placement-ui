import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { HoursWorkedClient } from '../../../httpClients/hours-worked-http-client';
import { getDateStringFromUnixSeconds, getUnixSeconds, parseTimeToSeconds } from '../../../misc/transformers';
import { HoursWorkedCreateEdit, PayPeriodCreateEdit } from '../../../poco/endpointRequestBodies';
import { PayPeriod } from '../../../poco/models';
import { LocalStringDateField, LocalStringTimeField, LocalSubmitButton, SelectListOption } from '../../local-form/local-fields';

const SECONDS_PER_DAY = 24 * 60 * 60;

@Component({
  selector: 'app-pay-period-form',
  imports: [ReactiveFormsModule, SelectModule, DatePipe, DecimalPipe, TableModule, LocalStringDateField, LocalStringTimeField, LocalSubmitButton],
  templateUrl: './pay-period-form.html',
  styleUrl: './pay-period-form.scss',
})
export class PayPeriodForm implements OnInit {
  private httpClient = inject(HoursWorkedClient);
  private route = inject(ActivatedRoute);
  private dragonId = 0;
  private assignmentId = 0;

  candidates = signal<PayPeriod[]>([]);
  candidateOptions = computed<SelectListOption[]>(() =>
    this.candidates().map(c => ({
      display: `${getDateStringFromUnixSeconds(c.startDateUnix)} - ${getDateStringFromUnixSeconds(c.endDateUnix)}` ,
      value: c.startDateUnix.toString(),
    }))
  );

  formGroup = signal(new FormGroup({
    dragonId: new FormControl<number>(0),
    assignmentId: new FormControl<number>(0),
    startDateUnix: new FormControl<number | null>(null, [Validators.required]),
    endDateUnix: new FormControl<number | null>(null, [Validators.required]),
    hoursWorked: new FormArray<FormGroup>([]),
  }));

  hoursWorkedRows = signal<FormGroup[]>([]);
  selectedCandidate = signal<PayPeriod | null>(null);
  minDate = computed(() => {
    const c = this.selectedCandidate();
    return c ? getDateStringFromUnixSeconds(c.startDateUnix) : null;
  });
  maxDate = computed(() => {
    const c = this.selectedCandidate();
    return c ? getDateStringFromUnixSeconds(c.endDateUnix) : null;
  });

  get hoursWorkedArray() {
    return this.formGroup().get('hoursWorked') as FormArray;
  }

  constructor() {
    this.route.params.subscribe(params => {
      this.dragonId = params['dragonId'] || 0;
      this.assignmentId = params['assignmentId'] || 0;
      this.formGroup().patchValue({
        dragonId: this.dragonId,
        assignmentId: this.assignmentId,
      });
    });
  }

  ngOnInit() {
    this.httpClient.getPayPeriodCandidates(this.dragonId, this.assignmentId)
      .then(r => this.candidates.set(r.payload));
  }

  onCandidateSelect(event: { value: string }) {
    const match = this.candidates().find(c => c.startDateUnix.toString() === event.value);
    if (match) {
      this.selectedCandidate.set(match);
      this.formGroup().patchValue({
        startDateUnix: match.startDateUnix,
        endDateUnix: match.endDateUnix,
      });
      this.hoursWorkedArray.clear();
      this.hoursWorkedRows.set(this.cloneHoursWorkedArray());
    }
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
