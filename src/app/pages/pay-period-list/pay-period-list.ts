import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, RouterLink } from '@angular/router';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { PAGE_SIZE } from '../../../global-consts';
import { HoursWorkedClient } from '../../../httpClients/hours-worked-http-client';
import { PayPeriod } from '../../../poco/models';

@Component({
  selector: 'app-pay-period-list',
  imports: [TableModule, RouterLink, DatePipe],
  providers: [ HoursWorkedClient ],
  templateUrl: './pay-period-list.html',
  styleUrl: './pay-period-list.scss',
})
export class PayPeriodList implements OnDestroy {
  httpClient = inject(HoursWorkedClient);
  private activatedRoute = inject(ActivatedRoute);

  payPeriods = signal<PayPeriod[]>([]);
  totalRecords = signal(0);
  readonly pageSize = PAGE_SIZE;

  private routeParams = toSignal(this.activatedRoute.params, { initialValue: {} as Params });
  dragonId = computed(() => this.routeParams()['dragonId']);
  assignmentId = computed(() => this.routeParams()['assignmentId']);

  ngOnDestroy(): void {
    this.httpClient.unsubscribe();
  }

  onPageChange(event: TableLazyLoadEvent) {
    const offset = event.first || 0;
    this.httpClient
      .getOnePageOfPayPeriods(this.assignmentId(), offset, this.pageSize)
      .subscribe(pagedData => {
        this.payPeriods.set(pagedData.data);
        this.totalRecords.set(pagedData.totalRecords);
      });
  }
}
