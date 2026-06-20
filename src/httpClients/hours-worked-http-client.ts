import { Injectable } from '@angular/core';
import { HoursWorkedCreateEdit, HoursWorkedWithJob, PayPeriodCreateEdit } from '../poco/endpoint-request-bodies';
import { HoursWorked, PayPeriod } from '../poco/models';
import { HoursWorkedValidationFailures, PayPeriodValidationFailures } from '../poco/validationFailures';
import { apiUrl } from './api-url';
import { HttpHelpers } from './http-helpers';

@Injectable({
  providedIn: 'root',
})
export class HoursWorkedClient {
  async getOnePageOfPayPeriods(dragonId: number, assignmentId: number, offset: number, limit: number) {
    return await HttpHelpers.getOnePage<PayPeriod>(`${apiUrl}dragon/${dragonId}/assignment/${assignmentId}/payperiod?offset=${offset}&limit=${limit}`);
  }

  async getPayPeriodCandidates(dragonId: number, assignmentId: number) {
    return await HttpHelpers.requestValidatedPayload<PayPeriod[]>(`${apiUrl}dragon/${dragonId}/assignment/${assignmentId}/payperiodcandidate`);
  }

  async getPayPeriod(payPeriodId: number) {
    return await HttpHelpers.requestValidatedPayload<PayPeriod>(`${apiUrl}payperiod/${payPeriodId}`);
  }

  async postPayPeriodForm(body: PayPeriodCreateEdit) {
    return await HttpHelpers.submitForm<PayPeriod, PayPeriodValidationFailures>(`${apiUrl}payperiod`, 'POST', body);
  }

  async putPayPeriodForm(payPeriodId: number, body: PayPeriodCreateEdit) {
    return await HttpHelpers.submitForm<PayPeriod, PayPeriodValidationFailures>(`${apiUrl}payperiod/${payPeriodId}`, 'PUT', body);
  }
}
