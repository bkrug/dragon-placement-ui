import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HoursWorkedClient } from '../../../httpClients/assignment-http-client';
import { getDateStringFromUnixSeconds } from '../../../misc/transformers';
import { PayPeriod } from '../../../poco/models';
import { LocalSelectField, SelectListOption } from '../../local-form/local-fields';

@Component({
  selector: 'app-pay-period-form',
  imports: [ReactiveFormsModule, LocalSelectField, DatePipe],
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
    startDateUnix: new FormControl<string | null>(null, [Validators.required]),
  }));

  selectedCandidate = signal<PayPeriod | null>(null);

  constructor() {
    this.route.params.subscribe(params => {
      this.dragonId = params['dragonId'] || 0;
      this.assignmentId = params['assignmentId'] || 0;
    });
  }

  ngOnInit() {
    this.httpClient.getPayPeriodCandidates(this.dragonId, this.assignmentId)
      .then(r => this.candidates.set(r.payload));

    this.formGroup().get('startDateUnix')!.valueChanges.subscribe(value => {
      const match = this.candidates().find(c => c.startDateUnix.toString() === value);
      this.selectedCandidate.set(match ?? null);
    });
  }
}
