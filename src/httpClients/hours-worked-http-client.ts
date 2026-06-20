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
  async getOnePageOfHoursWorked(dragonId: number, assignmentId: number, offset: number, limit: number) {
    return await HttpHelpers.getOnePage<HoursWorkedWithJob>(`${apiUrl}dragon/${dragonId}/assignment/${assignmentId}/hoursworked?offset=${offset}&limit=${limit}`);
  }

  async getHoursWorked(hoursWorkedId: number) {
    return await HttpHelpers.requestValidatedPayload<HoursWorked>(`${apiUrl}hoursworked/${hoursWorkedId}`);
  }

  async postHoursWorkedForm(body: HoursWorkedCreateEdit) {
    return await HttpHelpers.submitForm<HoursWorked, HoursWorkedValidationFailures>(`${apiUrl}hoursworked`, 'POST', body);
  }

  async putHoursWorkedForm(hoursWorkedId: number, body: HoursWorkedCreateEdit) {
    return await HttpHelpers.submitForm<HoursWorked, HoursWorkedValidationFailures>(`${apiUrl}hoursworked/${hoursWorkedId}`, 'PUT', body);
  }

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
