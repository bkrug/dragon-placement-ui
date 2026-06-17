import { DecimalPipe } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HoursWorkedClient } from '../../../httpClients/assignment-http-client';
import { getDateFromUnixSeconds, getUnixSeconds } from '../../../misc/transformers';
import { HoursWorkedCreateEdit } from '../../../poco/endpointRequestBodies';
import { HoursWorked, HoursWorkedValidationFailures } from '../../../poco/models';
import { EntityFormBase } from '../../local-form/entity-form-base';
import { LocalDateField, LocalSubmitButton, LocalTimeField } from '../../local-form/local-fields';

const SECONDS_PER_DAY = 24*60*60;

@Component({
  selector: 'app-hours-worked-form',
  imports: [ReactiveFormsModule, LocalDateField, LocalTimeField, LocalSubmitButton, DecimalPipe],
  templateUrl: './hours-worked-form.html',
  styleUrl: './hours-worked-form.scss',
})
export class HoursWorkedForm extends EntityFormBase<HoursWorked, HoursWorkedValidationFailures> implements OnInit {
  httpClient = inject(HoursWorkedClient);
  private route = inject(ActivatedRoute);
  private dragonId: number = 0;
  private assignmentId: number = 0;

  totalHours = signal<number>(0);

  constructor() {
    super('hoursWorkedId');
    this.route.params.subscribe(params => {
      this.dragonId = params['dragonId'] || 0;
      this.assignmentId = params['assignmentId'] || 0;
      this.entityId = params['hoursWorkedId'] || 0;
    });
    effect((onCleanup) => {
      const fg = this.formGroup();
      this.calcTotalHours(fg.value);
      const sub = fg.valueChanges.subscribe(values => this.calcTotalHours(values));
      onCleanup(() => sub.unsubscribe());
    });
  }

  formGroup = signal(this.createFormGroup(new HoursWorked()));

  ngOnInit() {
    if (this.entityId) {
      this.httpClient.getHoursWorked(this.entityId)
        .then(r => {
          this.dragonId = r.payload.dragonId;
          this.assignmentId = r.payload.assignmentId;
          this.formGroup.set(this.createFormGroup(r.payload));
        });
    }
  }

  private createFormGroup(hw: HoursWorked) {
    return new FormGroup({
      workDateUnix: new FormControl<Date | null>(
        this.entityId ? getDateFromUnixSeconds(hw.startDateTimeUnix) : null,
        [Validators.required]
      ),      
      startDateTimeUnix: new FormControl<Date | null>(
        this.entityId ? getDateFromUnixSeconds(hw.startDateTimeUnix) : null,
        [Validators.required]
      ),
      endDateTimeUnix: new FormControl<Date | null>(
        this.entityId ? getDateFromUnixSeconds(hw.endDateTimeUnix) : null,
        [Validators.required]
      ),
    });
  }

  private calcTotalHours(values: { startDateTimeUnix?: Date | null, endDateTimeUnix?: Date | null }) {
    const start = values.startDateTimeUnix;
    const end = values.endDateTimeUnix;
    if (!start || !end) {
      this.totalHours.set(0);
      return;
    }
    const startSecs = getUnixSeconds(start) % SECONDS_PER_DAY;
    const endSecs = getUnixSeconds(end) % SECONDS_PER_DAY;
    this.totalHours.set(endSecs > startSecs
      ? (endSecs - startSecs) / 3600
      : (endSecs + SECONDS_PER_DAY - startSecs) / 3600
    );
  }

  protected override makeSubmissionRequest() {
    const values = this.formGroup().value;
    const workDateUnixSeconds = Math.floor(getUnixSeconds(values.workDateUnix) / SECONDS_PER_DAY) * SECONDS_PER_DAY;
    const startTimeUnixSeconds = getUnixSeconds(values.startDateTimeUnix) % SECONDS_PER_DAY;
    const endTimeUnixSeconds = getUnixSeconds(values.endDateTimeUnix) % SECONDS_PER_DAY;

    console.log(values.startDateTimeUnix);
    console.log(startTimeUnixSeconds);

    const body: HoursWorkedCreateEdit = {
      assignmentId: this.assignmentId,
      dragonId: this.dragonId,
      startDateTimeUnix: workDateUnixSeconds + startTimeUnixSeconds,
      endDateTimeUnix: endTimeUnixSeconds > startTimeUnixSeconds
        ? workDateUnixSeconds + endTimeUnixSeconds
        : workDateUnixSeconds + SECONDS_PER_DAY + endTimeUnixSeconds,
    };
    return this.entityId
      ? this.httpClient.putHoursWorkedForm(this.entityId, body)
      : this.httpClient.postHoursWorkedForm(body);
  }

  protected override handleSubmissionSuccess(payload: HoursWorked) {
    this.entityId = payload.hoursWorkedId;
  }
}
