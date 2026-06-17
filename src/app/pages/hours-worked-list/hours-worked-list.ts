import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { PAGE_SIZE } from '../../../global-consts';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { HoursWorkedWithJob } from '../../../poco/endpointRequestBodies';

@Component({
  selector: 'app-hours-worked-list',
  imports: [TableModule, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './hours-worked-list.html',
  styleUrl: './hours-worked-list.scss',
})
export class HoursWorkedList {
  httpClient = inject(AssignmentHttpClient);
  private activatedRoute = inject(ActivatedRoute);

  hoursWorked = signal<HoursWorkedWithJob[]>([]);
  totalRecords = signal(0);
  readonly pageSize = PAGE_SIZE;
  private dragonId: number = 0;

  constructor() {
    this.activatedRoute.params.subscribe(params => {
      this.dragonId = params['dragonId'];
    });
  }

  onPageChange(event: TableLazyLoadEvent) {
    const offset = event.first || 0;
    this.httpClient
      .getOnePageOfHoursWorked(this.dragonId, offset, this.pageSize)
      .then(pagedData => {
        this.hoursWorked.set(pagedData.data);
        this.totalRecords.set(pagedData.totalRecords);
      });
  }
}
