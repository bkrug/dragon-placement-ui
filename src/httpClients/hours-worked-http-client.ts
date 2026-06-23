import { Injectable } from '@angular/core';
import { PayPeriodCreateEdit, PayPeriodView, ValidPaySpan } from '../poco/endpoint-request-bodies';
import { PayPeriod } from '../poco/models';
import { PayPeriodValidationFailuresNew } from '../poco/validation-failures';
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
    return await HttpHelpers.requestValidatedPayload<ValidPaySpan[]>(`${apiUrl}v2/dragon/${dragonId}/assignment/${assignmentId}/payperiodcandidate`);
  }

  async getPayPeriod(payPeriodId: number) {
    return await HttpHelpers.requestValidatedPayload<PayPeriodView>(`${apiUrl}v2/payperiod/${payPeriodId}`);
  }

  async postPayPeriodForm(body: PayPeriodCreateEdit) {
    return await HttpHelpers.submitForm<PayPeriod, PayPeriodValidationFailuresNew>(`${apiUrl}v2/payperiod`, 'POST', body);
  }

  async putPayPeriodForm(payPeriodId: number, body: PayPeriodCreateEdit) {
    return await HttpHelpers.submitForm<PayPeriod, PayPeriodValidationFailuresNew>(`${apiUrl}v2/payperiod/${payPeriodId}`, 'PUT', body);
  }
}
