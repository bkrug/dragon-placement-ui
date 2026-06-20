import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { HoursWorkedClient } from '../../../httpClients/hours-worked-http-client';
import { getDateStringFromUnixSeconds } from '../../../misc/transformers';
import { PayPeriod } from '../../../poco/models';
import { SelectListOption } from '../../local-form/local-fields';
import { PayPeriodForm } from '../pay-period-form/pay-period-form';

@Component({
  selector: 'app-pay-period-create',
  imports: [SelectModule, PayPeriodForm],
  templateUrl: './pay-period-create.html',
  styleUrl: './pay-period-create.scss',
})
export class PayPeriodCreate implements OnInit {
  private httpClient = inject(HoursWorkedClient);
  private route = inject(ActivatedRoute);

  dragonId = signal(0);
  assignmentId = signal(0);

  candidates = signal<PayPeriod[]>([]);
  candidateOptions = computed<SelectListOption[]>(() =>
    this.candidates().map(c => ({
      display: `${getDateStringFromUnixSeconds(c.startDateUnix)} - ${getDateStringFromUnixSeconds(c.endDateUnix)}`,
      value: c.startDateUnix.toString(),
    }))
  );

  selectedCandidate = signal<PayPeriod | null>(null);

  constructor() {
    this.route.params.subscribe(params => {
      this.dragonId.set(params['dragonId'] || 0);
      this.assignmentId.set(params['assignmentId'] || 0);
    });
  }

  ngOnInit() {
    this.httpClient.getPayPeriodCandidates(this.dragonId(), this.assignmentId())
      .then(r => this.candidates.set(r.payload));
  }

  getNewPayPeriod() {
    const payPeriod = this.selectedCandidate();
    return payPeriod
      ? Object.assign(new PayPeriod(), {
          dragonId: this.dragonId,
          assignmentId: this.assignmentId,
          startDateUnix: payPeriod.startDateUnix,
          endDateUnix: payPeriod.endDateUnix
        })
      : null;
  }

  onCandidateSelect(event: { value: string }) {
    const match = this.candidates().find(c => c.startDateUnix.toString() === event.value);
    this.selectedCandidate.set(match ?? null);
  }
}
