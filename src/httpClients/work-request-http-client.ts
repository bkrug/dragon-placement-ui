import { Injectable } from '@angular/core';
import { CreateCustomerAndWorkRequest, WorkRequestCreateEdit } from '../poco/endpoint-request-bodies';
import { Customer, WorkRequest } from '../poco/models';
import { ValidationFailures } from '../poco/validation-failures';
import { apiUrl } from './api-url';
import { BaseHttpClient } from './base-http-client';

@Injectable({
  providedIn: 'root',
})
export class WorkRequestClient extends BaseHttpClient {
  getOnePageOfWorkRequests(offset: number, limit: number) {
    return this.getOnePage<WorkRequest>(`${apiUrl}workrequest?offset=${offset}&limit=${limit}`);
  }

  getWorkRequest(workRequestId: number) {
    return this.requestValidatedPayload<WorkRequest>(`${apiUrl}workrequest/${workRequestId}`);
  }

  searchCustomers(name: string, count: number) {
    return this.requestValidatedPayload<Customer[]>(`${apiUrl}customer?name=${encodeURIComponent(name)}&count=${count}`);
  }

  postCustomerWithWorkRequestForm(body: CreateCustomerAndWorkRequest) {
    return this.submitForm<WorkRequest, ValidationFailures>(`${apiUrl}customer`, 'POST', body);
  }

  postWorkRequestForm(customerId: number, body: WorkRequestCreateEdit) {
    return this.submitForm<WorkRequest, ValidationFailures>(`${apiUrl}customer/${customerId}/workrequest`, 'POST', body);
  }

  putWorkRequestForm(workRequestId: number, body: WorkRequestCreateEdit) {
    return this.submitForm<WorkRequest, ValidationFailures>(`${apiUrl}workrequest/${workRequestId}`, 'PUT', body);
  }
}
