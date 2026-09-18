import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { HoursWorkedClient } from '../../../httpClients/hours-worked-http-client';
import { ValidPaySpan } from '../../../poco/endpoint-request-bodies';
import { PayPeriod } from '../../../poco/models';
import { SelectListOption } from '../../local-form/local-fields';
import { PayPeriodForm } from '../pay-period-form/pay-period-form';

@Component({
  selector: 'app-pay-period-create',
  imports: [SelectModule, PayPeriodForm],
  providers: [ HoursWorkedClient ],
  templateUrl: './pay-period-create.html',
  styleUrl: './pay-period-create.scss',
})
export class PayPeriodCreate implements OnInit, OnDestroy {
  private httpClient = inject(HoursWorkedClient);
  private route = inject(ActivatedRoute);

  candidates = signal<ValidPaySpan[]>([]);
  candidateOptions = computed<SelectListOption[]>(() =>
    this.candidates().map(c => ({
      display: `${c.startDate} - ${c.endDate}`,
      id: c.startDate.toString(),
    }))
  );

  selectedCandidate = signal<PayPeriod | null>(null);

  private routeParams = toSignal(this.route.params, { initialValue: {} as Params });
  private dragonId = computed(() => this.routeParams()['dragonId']);
  private assignmentId = computed(() => this.routeParams()['assignmentId']);

  ngOnInit() {
    //TODO: Consider making HTTP requests from rxResource() instead of ngOnInit()
    this.httpClient.getPayPeriodCandidates(this.assignmentId())
      .subscribe(r => this.candidates.set(r.payload));
  }

  ngOnDestroy(): void {
    this.httpClient.unsubscribe();
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
