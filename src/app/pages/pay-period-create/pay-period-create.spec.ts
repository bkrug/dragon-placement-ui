import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Effect } from 'effect';
import { HoursWorkedClient } from '../../../httpClients/hours-worked-http-client';
import { PayPeriodCreateEditNew, ValidPaySpan } from '../../../poco/endpoint-request-bodies';
import { PayPeriod } from '../../../poco/models';
import { ValidatedForm, ValidatedPayload } from '../../../poco/standard-responses';
import { PayPeriodValidationFailuresNew } from '../../../poco/validation-failures';
import { MockActivatedRoute } from '../../../testHelpers/MockActivatedRoute';
import { PayPeriodForm } from '../pay-period-form/pay-period-form';
import { PayPeriodCreate } from './pay-period-create';

describe('Pay Period Create Tests', () => {
  const dragonId = 5;
  const assignmentId = 10;
  const payPeriodStartUnix = 1262304000; // 2010-01-01
  const payPeriodEndUnix = 1263513600;   // 2010-01-15
  const payPeriodStart = '2010-01-01';
  const payPeriodEnd = '2010-01-15';
  const postResponsePayPeriodId = 42;

  it('should show no form initially, then create via POST and update via PUT', async () => {
    const candidate = Object.assign(new ValidPaySpan(), {
      startDate: payPeriodStart,
      endDate: payPeriodEnd,
    });

    const mockHttpClient = new HoursWorkedClient();
    mockHttpClient.getPayPeriodCandidates = async () => ({
      isInternalError: false,
      isSuccess: true,
      validationFailures: [],
      payload: [candidate]
    } as ValidatedPayload<ValidPaySpan[]>);

    let actualPostBody = new PayPeriodCreateEditNew();
    mockHttpClient.postPayPeriodForm = async (body: PayPeriodCreateEditNew) => {
      actualPostBody = body;
      const responsePayload = Object.assign(new PayPeriod(), {
        payPeriodId: postResponsePayPeriodId,
        dragonId: body.dragonId,
        assignmentId: body.assignmentId,
        startDate: body.startDate,
        endDate: body.endDate,
      });
      return Effect.succeed({
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: responsePayload
      } as ValidatedPayload<PayPeriod>) as Effect.Effect<ValidatedPayload<PayPeriod>, ValidatedForm<PayPeriodValidationFailuresNew>, never>;
    };

    let actualPutId = 0;
    let actualPutBody = new PayPeriodCreateEditNew();
    mockHttpClient.putPayPeriodForm = async (payPeriodId: number, body: PayPeriodCreateEditNew) => {
      actualPutId = payPeriodId;
      actualPutBody = body;
      const responsePayload = Object.assign(new PayPeriod(), {
        payPeriodId,
        dragonId: body.dragonId,
        assignmentId: body.assignmentId,
        startDate: body.startDate,
        endDate: body.endDate,
      });
      return Effect.succeed({
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: responsePayload
      } as ValidatedPayload<PayPeriod>) as Effect.Effect<ValidatedPayload<PayPeriod>, ValidatedForm<PayPeriodValidationFailuresNew>, never>;
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
    component.onCandidateSelect({ value: payPeriodStart });
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
    const jan2Unix = 1262390400;
    const jan5Unix = 1262649600;
    const jan8Unix = 1262908800;
    expect(actualPostBody).toMatchObject({
      dragonId,
      assignmentId,
      startDate: payPeriodStart,
      endDate: payPeriodEnd,
      hoursWorked: [
        { startDateTime: "2010-01-02T08:00", endDateTime: "2010-01-02T16:00" },
        { startDateTime: "2010-01-05T09:00", endDateTime: "2010-01-05T17:00" },
        { startDateTime: "2010-01-08T10:00", endDateTime: "2010-01-08T14:00" },
      ],
    });

    //Act: second submit (should PUT using payPeriodId from POST response)
    payPeriodForm.onSubmit();
    await fixture.whenStable();

    //Assert: PUT used the payPeriodId returned by the POST
    expect(actualPutId).toEqual(postResponsePayPeriodId);
    expect(actualPutBody).toMatchObject({
      dragonId,
      assignmentId,
      startDate: payPeriodStart,
      endDate: payPeriodEnd,
      hoursWorked: [
        { startDateTime: "2010-01-02T08:00", endDateTime: "2010-01-02T16:00" },
        { startDateTime: "2010-01-05T09:00", endDateTime: "2010-01-05T17:00" },
        { startDateTime: "2010-01-08T10:00", endDateTime: "2010-01-08T14:00" }
      ],
    });
  });

  it('should disable submit and show error styling when hours-worked fields are empty', async () => {
    const candidate = Object.assign(new ValidPaySpan(), {
      startDate: payPeriodStart,
      endDate: payPeriodEnd,
    });

    const mockHttpClient = new HoursWorkedClient();
    mockHttpClient.getPayPeriodCandidates = async () => ({
      isInternalError: false,
      isSuccess: true,
      validationFailures: [],
      payload: [candidate]
    } as ValidatedPayload<ValidPaySpan[]>);

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

    //Act: select a candidate and add a row with empty fields
    component.onCandidateSelect({ value: payPeriodStart });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const payPeriodFormDebugEl = fixture.debugElement.query(By.directive(PayPeriodForm));
    const payPeriodForm = payPeriodFormDebugEl.componentInstance as PayPeriodForm;

    payPeriodForm.addRow();
    fixture.detectChanges();

    //Assert: form is invalid because row fields are empty
    expect(payPeriodForm.formGroup().valid).toEqual(false);

    //Assert: submit button is disabled
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitButton.disabled).toEqual(true);

    //Act: mark all fields as touched so error styling appears
    payPeriodForm.formGroup().markAllAsTouched();
    fixture.detectChanges();

    //Assert: inputs show invalid styling
    const invalidInputs = fixture.nativeElement.querySelectorAll('input.p-invalid');
    expect(invalidInputs.length).toEqual(3);

    //Assert: error messages are displayed
    const errorMessages = [...fixture.nativeElement.querySelectorAll('app-pay-period-form p-message')]
      .map((el: HTMLElement) => el.textContent?.trim());
    expect(errorMessages).toMatchObject(['required', 'required', 'required']);

    //Act: fill in only the work date, leaving times empty
    payPeriodForm.hoursWorkedArray.at(0).patchValue({ workDate: '2010-01-02' });
    payPeriodForm.formGroup().markAllAsTouched();
    fixture.detectChanges();

    //Assert: still invalid — time fields are required
    expect(payPeriodForm.formGroup().valid).toEqual(false);
    expect(submitButton.disabled).toEqual(true);
  });

  it('should sort hours-worked rows in ascending order by date and time', async () => {
    const candidate = Object.assign(new ValidPaySpan(), {
      startDate: payPeriodStart,
      endDate: payPeriodEnd,
    });

    const mockHttpClient = new HoursWorkedClient();
    mockHttpClient.getPayPeriodCandidates = async () => ({
      isInternalError: false,
      isSuccess: true,
      validationFailures: [],
      payload: [candidate]
    } as ValidatedPayload<ValidPaySpan[]>);

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

    component.onCandidateSelect({ value: payPeriodStart });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const payPeriodFormDebugEl = fixture.debugElement.query(By.directive(PayPeriodForm));
    const payPeriodForm = payPeriodFormDebugEl.componentInstance as PayPeriodForm;

    //Act: add 3 rows in non-sorted order
    payPeriodForm.addRow();
    payPeriodForm.hoursWorkedArray.at(0).patchValue({ workDate: '2010-01-04', startDateTime: '09:00', endDateTime: '17:00' }); // Monday

    payPeriodForm.addRow();
    payPeriodForm.hoursWorkedArray.at(1).patchValue({ workDate: '2010-01-05', startDateTime: '14:00', endDateTime: '18:00' }); // Tuesday afternoon

    payPeriodForm.addRow();
    payPeriodForm.hoursWorkedArray.at(2).patchValue({ workDate: '2010-01-05', startDateTime: '09:00', endDateTime: '13:00' }); // Tuesday morning

    //Act: add an empty row, which triggers re-sort
    payPeriodForm.addRow();
    fixture.detectChanges();

    //Assert: displayed rows are sorted ascending by workDate then startDateTime
    const displayedRows = payPeriodForm.hoursWorkedRows();
    expect(displayedRows.map(r => r.value)).toMatchObject([
      { workDate: '2010-01-04', startDateTime: '09:00', endDateTime: '17:00' },
      { workDate: '2010-01-05', startDateTime: '09:00', endDateTime: '13:00' },
      { workDate: '2010-01-05', startDateTime: '14:00', endDateTime: '18:00' },
      { workDate: null, startDateTime: null, endDateTime: null },
    ]);
  });
});
