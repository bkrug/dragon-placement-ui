import { Injectable } from '@angular/core';
import { PayPeriodCreateEdit, PayPeriodView, ValidPaySpan } from '../poco/endpoint-request-bodies';
import { PayPeriod } from '../poco/models';
import { ValidationFailures } from '../poco/validation-failures';
import { apiUrl } from './api-url';
import { BaseHttpClient } from './base-http-client';
import { HttpHelpers } from './http-helpers';

@Injectable({
  providedIn: 'root',
})
export class HoursWorkedClient extends BaseHttpClient {
  getOnePageOfPayPeriods(assignmentId: number, offset: number, limit: number) {
    return this.getOnePage<PayPeriod>(`${apiUrl}dragon/0/assignment/${assignmentId}/payperiod?offset=${offset}&limit=${limit}`);
  }

  getPayPeriodCandidates(assignmentId: number) {
    return this.requestValidatedPayload<ValidPaySpan[]>(`${apiUrl}v2/dragon/0/assignment/${assignmentId}/payperiodcandidate`);
  }

  getPayPeriod(payPeriodId: number) {
    return this.requestValidatedPayload<PayPeriodView>(`${apiUrl}v2/payperiod/${payPeriodId}`);
  }

  async postPayPeriodForm(body: PayPeriodCreateEdit) {
    return await HttpHelpers.submitForm<PayPeriod, ValidationFailures>(`${apiUrl}v2/payperiod`, 'POST', body);
  }

  async putPayPeriodForm(payPeriodId: number, body: PayPeriodCreateEdit) {
    return await HttpHelpers.submitForm<PayPeriod, ValidationFailures>(`${apiUrl}v2/payperiod/${payPeriodId}`, 'PUT', body);
  }
}
