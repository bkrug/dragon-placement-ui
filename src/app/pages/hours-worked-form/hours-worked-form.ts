import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { HoursWorkedCreateEdit } from '../../../poco/endpointRequestBodies';
import { HoursWorked, HoursWorkedValidationFailures } from '../../../poco/models';
import { EntityFormBase } from '../../local-form/entity-form-base';
import { LocalDateField, LocalSubmitButton, LocalTimeField } from '../../local-form/local-fields';

@Component({
  selector: 'app-hours-worked-form',
  imports: [ReactiveFormsModule, LocalDateField, LocalTimeField, LocalSubmitButton],
  templateUrl: './hours-worked-form.html',
  styleUrl: './hours-worked-form.scss',
})
export class HoursWorkedForm extends EntityFormBase<HoursWorked, HoursWorkedValidationFailures> implements OnInit {
  httpClient = inject(AssignmentHttpClient);
  private route = inject(ActivatedRoute);
  private dragonId: number = 0;
  private assignmentId: number = 0;

  constructor() {
    super('hoursWorkedId');
    this.route.params.subscribe(params => {
      this.dragonId = params['dragonId'] || 0;
      this.assignmentId = params['assignmentId'] || 0;
      this.entityId = params['hoursWorkedId'] || 0;
    });
  }

  formGroup = signal(this.createFormGroup(new HoursWorked()));

  ngOnInit() {
    if (this.entityId) {
      this.httpClient.getHoursWorked(this.entityId)
        .then(r => {
          return this.formGroup.set(this.createFormGroup(r.payload));
        });
    }
  }

  private createFormGroup(hw: HoursWorked) {
    return new FormGroup({
      workDateUnix: new FormControl<Date | null>(
        hw.startDateTimeUnix ? new Date(hw.startDateTimeUnix * 1000) : null,
        [Validators.required]
      ),      
      startDateTimeUnix: new FormControl<Date | null>(
        hw.startDateTimeUnix ? new Date(hw.startDateTimeUnix * 1000) : null,
        [Validators.required]
      ),
      endDateTimeUnix: new FormControl<Date | null>(
        hw.endDateTimeUnix ? new Date(hw.endDateTimeUnix * 1000) : null,
        [Validators.required]
      ),
    });
  }

  protected override makeSubmissionRequest() {
    const values = this.formGroup().value;
    const body: HoursWorkedCreateEdit = {
      assignmentId: this.assignmentId,
      dragonId: this.dragonId,
      startDateTimeUnix: Math.floor(values.startDateTimeUnix!.getTime() / 1000),
      endDateTimeUnix: Math.floor(values.endDateTimeUnix!.getTime() / 1000),
    };
    return this.entityId
      ? this.httpClient.putHoursWorkedForm(this.entityId, body)
      : this.httpClient.postHoursWorkedForm(body);
  }

  protected override handleSubmissionSuccess(payload: HoursWorked) {
    this.entityId = payload.hoursWorkedId;
  }
}
