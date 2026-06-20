import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Effect } from 'effect';
import { HoursWorkedClient } from '../../../httpClients/hours-worked-http-client';
import { PayPeriodCreateEdit } from '../../../poco/endpoint-request-bodies';
import { PayPeriod } from '../../../poco/models';
import { ValidatedForm, ValidatedPayload } from '../../../poco/standard-responses';
import { PayPeriodValidationFailures } from '../../../poco/validation-failures';
import { MockActivatedRoute } from '../../../testHelpers/MockActivatedRoute';
import { PayPeriodCreate } from './pay-period-create';
import { PayPeriodForm } from '../pay-period-form/pay-period-form';

describe('Pay Period Create Tests', () => {
  const dragonId = 5;
  const assignmentId = 10;
  const payPeriodStartUnix = 1262304000; // 2010-01-01
  const payPeriodEndUnix = 1263513600;   // 2010-01-15
  const postResponsePayPeriodId = 42;

  it('should show no form initially, then create via POST and update via PUT', async () => {
    const candidate = Object.assign(new PayPeriod(), {
      dragonId,
      assignmentId,
      startDateUnix: payPeriodStartUnix,
      endDateUnix: payPeriodEndUnix,
    });

    const mockHttpClient = new HoursWorkedClient();
    mockHttpClient.getPayPeriodCandidates = async () => ({
      isInternalError: false,
      isSuccess: true,
      validationFailures: [],
      payload: [candidate]
    } as ValidatedPayload<PayPeriod[]>);

    let actualPostBody = new PayPeriodCreateEdit();
    mockHttpClient.postPayPeriodForm = async (body: PayPeriodCreateEdit) => {
      actualPostBody = body;
      const responsePayload = Object.assign(new PayPeriod(), {
        payPeriodId: postResponsePayPeriodId,
        dragonId: body.dragonId,
        assignmentId: body.assignmentId,
        startDateUnix: body.startDateUnix,
        endDateUnix: body.endDateUnix,
      });
      return Effect.succeed({
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: responsePayload
      } as ValidatedPayload<PayPeriod>) as Effect.Effect<ValidatedPayload<PayPeriod>, ValidatedForm<PayPeriodValidationFailures>, never>;
    };

    let actualPutId = 0;
    let actualPutBody = new PayPeriodCreateEdit();
    mockHttpClient.putPayPeriodForm = async (payPeriodId: number, body: PayPeriodCreateEdit) => {
      actualPutId = payPeriodId;
      actualPutBody = body;
      const responsePayload = Object.assign(new PayPeriod(), {
        payPeriodId,
        dragonId: body.dragonId,
        assignmentId: body.assignmentId,
        startDateUnix: body.startDateUnix,
        endDateUnix: body.endDateUnix,
      });
      return Effect.succeed({
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: responsePayload
      } as ValidatedPayload<PayPeriod>) as Effect.Effect<ValidatedPayload<PayPeriod>, ValidatedForm<PayPeriodValidationFailures>, never>;
    };

    const mockActivatedRoute = new MockActivatedRoute();
    mockActivatedRoute.setParams({ dragonId, assignmentId });
    TestBed.configureTestingModule({
      providers: [
        { provide: HoursWorkedClient, useValue: mockHttpClient },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    await TestBed.configureTestingModule({ imports: [PayPeriodCreate] }).compileComponents();
    const fixture = TestBed.createComponent(PayPeriodCreate);
    const component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();

    //Assert: form is not initially visible
    expect(fixture.nativeElement.querySelector('app-pay-period-form')).toBeNull();

    //Act: select a pay period candidate
    component.onCandidateSelect({ value: payPeriodStartUnix.toString() });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    //Assert: form is now visible
    expect(fixture.nativeElement.querySelector('app-pay-period-form')).not.toBeNull();

    //Arrange: get the child PayPeriodForm and add 3 hours worked rows
    const payPeriodFormDebugEl = fixture.debugElement.query(By.directive(PayPeriodForm));
    const payPeriodForm = payPeriodFormDebugEl.componentInstance as PayPeriodForm;

    payPeriodForm.addRow();
    payPeriodForm.addRow();
    payPeriodForm.addRow();

    const rows = payPeriodForm.hoursWorkedArray;
    rows.at(0).patchValue({ workDate: '2010-01-02', startDateTime: '08:00', endDateTime: '16:00' });
    rows.at(1).patchValue({ workDate: '2010-01-05', startDateTime: '09:00', endDateTime: '17:00' });
    rows.at(2).patchValue({ workDate: '2010-01-08', startDateTime: '10:00', endDateTime: '14:00' });
    fixture.detectChanges();

    //Act: first submit (should POST)
    payPeriodForm.onSubmit();
    await fixture.whenStable();

    //Assert: POST body matches form contents
    expect(actualPostBody.dragonId).toEqual(dragonId);
    expect(actualPostBody.assignmentId).toEqual(assignmentId);
    expect(actualPostBody.startDateUnix).toEqual(payPeriodStartUnix);
    expect(actualPostBody.endDateUnix).toEqual(payPeriodEndUnix);
    expect(actualPostBody.hoursWorked.length).toEqual(3);

    // Row 0: 2010-01-02 08:00-16:00
    const jan2Unix = 1262390400;
    expect(actualPostBody.hoursWorked[0].dragonId).toEqual(dragonId);
    expect(actualPostBody.hoursWorked[0].assignmentId).toEqual(assignmentId);
    expect(actualPostBody.hoursWorked[0].startDateTimeUnix).toEqual(jan2Unix + 8 * 3600);
    expect(actualPostBody.hoursWorked[0].endDateTimeUnix).toEqual(jan2Unix + 16 * 3600);

    // Row 1: 2010-01-05 09:00-17:00
    const jan5Unix = 1262649600;
    expect(actualPostBody.hoursWorked[1].startDateTimeUnix).toEqual(jan5Unix + 9 * 3600);
    expect(actualPostBody.hoursWorked[1].endDateTimeUnix).toEqual(jan5Unix + 17 * 3600);

    // Row 2: 2010-01-08 10:00-14:00
    const jan8Unix = 1262908800;
    expect(actualPostBody.hoursWorked[2].startDateTimeUnix).toEqual(jan8Unix + 10 * 3600);
    expect(actualPostBody.hoursWorked[2].endDateTimeUnix).toEqual(jan8Unix + 14 * 3600);

    //Act: second submit (should PUT using payPeriodId from POST response)
    payPeriodForm.onSubmit();
    await fixture.whenStable();

    //Assert: PUT used the payPeriodId returned by the POST
    expect(actualPutId).toEqual(postResponsePayPeriodId);
    expect(actualPutBody.dragonId).toEqual(dragonId);
    expect(actualPutBody.assignmentId).toEqual(assignmentId);
    expect(actualPutBody.hoursWorked.length).toEqual(3);
  });
});
