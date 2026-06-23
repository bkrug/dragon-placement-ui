import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { PAGE_SIZE } from '../../../global-consts';
import { HoursWorkedClient } from '../../../httpClients/hours-worked-http-client';
import { PayPeriod } from '../../../poco/models';

@Component({
  selector: 'app-pay-period-list',
  imports: [TableModule, DatePipe, RouterLink],
  templateUrl: './pay-period-list.html',
  styleUrl: './pay-period-list.scss',
})
export class PayPeriodList {
  httpClient = inject(HoursWorkedClient);
  private activatedRoute = inject(ActivatedRoute);

  payPeriods = signal<PayPeriod[]>([]);
  totalRecords = signal(0);
  readonly pageSize = PAGE_SIZE;
  dragonId = signal(0);
  assignmentId = signal(0);

  constructor() {
    this.activatedRoute.params.subscribe(params => {
      this.dragonId.set(params['dragonId']);
      this.assignmentId.set(params['assignmentId']);
    });
  }

  onPageChange(event: TableLazyLoadEvent) {
    const offset = event.first || 0;
    this.httpClient
      .getOnePageOfPayPeriods(this.assignmentId(), offset, this.pageSize)
      .then(pagedData => {
        this.payPeriods.set(pagedData.data);
        this.totalRecords.set(pagedData.totalRecords);
      });
  }
}
