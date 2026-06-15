import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { PAGE_SIZE } from '../../../global-consts';
import { AssignmentHttpClient } from '../../../httpClients/assignment-http-client';
import { HoursWorked } from '../../../poco/models';

@Component({
  selector: 'app-hours-worked-list',
  imports: [TableModule, DatePipe, DecimalPipe],
  templateUrl: './hours-worked-list.html',
  styleUrl: './hours-worked-list.scss',
})
export class HoursWorkedList {
  httpClient = inject(AssignmentHttpClient);
  private activatedRoute = inject(ActivatedRoute);

  hoursWorked = signal<HoursWorked[]>([]);
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
