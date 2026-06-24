import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { HoursWorkedClient } from '../../../httpClients/hours-worked-http-client';
import { ValidPaySpan } from '../../../poco/endpoint-request-bodies';
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

  candidates = signal<ValidPaySpan[]>([]);
  candidateOptions = computed<SelectListOption[]>(() =>
    this.candidates().map(c => ({
      display: `${c.startDate} - ${c.endDate}`,
      value: c.startDate.toString(),
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
    this.httpClient.getPayPeriodCandidates(this.assignmentId())
      .then(r => this.candidates.set(r.payload));
  }

  onCandidateSelect(event: { value: string }) {
    const match = this.candidates().find(c => c.startDate === event.value);
    this.selectedCandidate.set(match
      ? Object.assign(new PayPeriod(), {
          assignmentId: this.assignmentId(),
          startDate: match.startDate,
          endDate: match.endDate
        })
      : null);
  }
}
