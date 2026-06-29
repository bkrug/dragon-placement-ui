import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Effect } from 'effect';
import { HoursWorkedClient } from '../../../httpClients/hours-worked-http-client';
import { PayPeriodCreateEdit, ValidPaySpan } from '../../../poco/endpoint-request-bodies';
import { PayPeriod } from '../../../poco/models';
import { ValidatedForm, ValidatedPayload } from '../../../poco/standard-responses';
import { GridRowValidationFailures, ValidationFailures } from '../../../poco/validation-failures';
import { MockActivatedRoute } from '../../../testHelpers/MockActivatedRoute';
import { PayPeriodForm } from '../pay-period-form/pay-period-form';
import { PayPeriodCreate } from './pay-period-create';

describe('Pay Period Create Tests', () => {
  const dragonId = 5;
  const assignmentId = 10;
  const payPeriodStart = '2010-01-01';
  const payPeriodEnd = '2010-01-15';
  const postResponsePayPeriodId = 42;

  beforeEach(() => TestBed.resetTestingModule());

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

    let actualPostBody = new PayPeriodCreateEdit();
    mockHttpClient.postPayPeriodForm = async (body: PayPeriodCreateEdit) => {
      actualPostBody = body;
      const responsePayload = Object.assign(new PayPeriod(), {
        payPeriodId: postResponsePayPeriodId,
        assignmentId: body.assignmentId,
        startDate: body.startDate,
        endDate: body.endDate,
      });
      return Effect.succeed({
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: responsePayload
      } as ValidatedPayload<PayPeriod>) as Effect.Effect<ValidatedPayload<PayPeriod>, ValidatedForm<ValidationFailures>, never>;
    };

    let actualPutId = 0;
    let actualPutBody = new PayPeriodCreateEdit();
    mockHttpClient.putPayPeriodForm = async (payPeriodId: number, body: PayPeriodCreateEdit) => {
      actualPutId = payPeriodId;
      actualPutBody = body;
      const responsePayload = Object.assign(new PayPeriod(), {
        payPeriodId,
        assignmentId: body.assignmentId,
        startDate: body.startDate,
        endDate: body.endDate,
      });
      return Effect.succeed({
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: responsePayload
      } as ValidatedPayload<PayPeriod>) as Effect.Effect<ValidatedPayload<PayPeriod>, ValidatedForm<ValidationFailures>, never>;
    };

    const mockActivatedRoute = new MockActivatedRoute();
    mockActivatedRoute.setParams({ assignmentId });
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
    expect(actualPostBody).toMatchObject({
      assignmentId,
      startDate: payPeriodStart,
      endDate: payPeriodEnd,
      hoursWorked: [
        { startDateTime: '2010-01-02T08:00', endDateTime: '2010-01-02T16:00' },
        { startDateTime: '2010-01-05T09:00', endDateTime: '2010-01-05T17:00' },
        { startDateTime: '2010-01-08T10:00', endDateTime: '2010-01-08T14:00' },
      ],
    });

    //Act: second submit (should PUT using payPeriodId from POST response)
    payPeriodForm.onSubmit();
    await fixture.whenStable();

    //Assert: PUT used the payPeriodId returned by the POST
    expect(actualPutId).toEqual(postResponsePayPeriodId);
    expect(actualPutBody).toMatchObject({
      assignmentId,
      startDate: payPeriodStart,
      endDate: payPeriodEnd,
      hoursWorked: [
        { startDateTime: '2010-01-02T08:00', endDateTime: '2010-01-02T16:00' },
        { startDateTime: '2010-01-05T09:00', endDateTime: '2010-01-05T17:00' },
        { startDateTime: '2010-01-08T10:00', endDateTime: '2010-01-08T14:00' }
      ],
    });
  });

  it('when the clock-out time is earlier than the clock-in time, assume that the clock out time is the next day', async () => {
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

    let actualPostBody = new PayPeriodCreateEdit();
    mockHttpClient.postPayPeriodForm = async (body: PayPeriodCreateEdit) => {
      actualPostBody = body;
      const responsePayload = Object.assign(new PayPeriod(), {
        payPeriodId: postResponsePayPeriodId,
        assignmentId: body.assignmentId,
        startDate: body.startDate,
        endDate: body.endDate,
      });
      return Effect.succeed({
        isInternalError: false,
        isSuccess: true,
        validationFailures: [],
        payload: responsePayload
      } as ValidatedPayload<PayPeriod>) as Effect.Effect<ValidatedPayload<PayPeriod>, ValidatedForm<ValidationFailures>, never>;
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

    //Act: select a pay period candidate
    component.onCandidateSelect({ value: payPeriodStart });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    //Act: get the child PayPeriodForm and add a work period that overlapped with midnight
    const payPeriodFormDebugEl = fixture.debugElement.query(By.directive(PayPeriodForm));
    const payPeriodForm = payPeriodFormDebugEl.componentInstance as PayPeriodForm;

    payPeriodForm.addRow();
    const rows = payPeriodForm.hoursWorkedArray;
    rows.at(0).patchValue({ workDate: '2010-01-03', startDateTime: '22:00', endDateTime: '03:50' });
    fixture.detectChanges();

    //Act: first submit (should POST)
    payPeriodForm.onSubmit();
    await fixture.whenStable();

    //Assert: POST body matches form contents
    expect(actualPostBody).toMatchObject({
      assignmentId,
      startDate: payPeriodStart,
      endDate: payPeriodEnd,
      hoursWorked: [
        { startDateTime: '2010-01-03T22:00', endDateTime: '2010-01-04T03:50' },
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

  it('should show server-side validation errors on the correct hours-worked rows', async () => {
    const candidate = Object.assign(new ValidPaySpan(), {
      startDate: payPeriodStart,
      endDate: payPeriodEnd,
    });

    const row0Error = 'Start time overlaps with another entry';
    const row2Error = 'End time must be before pay-period end date';

    const mockHttpClient = new HoursWorkedClient();
    mockHttpClient.getPayPeriodCandidates = async () => ({
      isInternalError: false,
      isSuccess: true,
      validationFailures: [],
      payload: [candidate]
    } as ValidatedPayload<ValidPaySpan[]>);

    mockHttpClient.postPayPeriodForm = async () => {
      const failures: ValidationFailures = {
        fieldFailures: {},
        gridRowFailures: {
          hoursWorked: [
            { index: 0, rowValidationMessage: '', fieldFailures: { startDateTime: row0Error }, gridRowFailures: {} } as GridRowValidationFailures,
            { index: 2, rowValidationMessage: '', fieldFailures: { endDateTime: row2Error }, gridRowFailures: {} } as GridRowValidationFailures,
          ],
        },
      };
      const failBody = {
        isInternalError: false,
        isSuccess: false,
        validationFailures: failures
      } as ValidatedForm<ValidationFailures>;
      return Effect.fail(failBody) as Effect.Effect<ValidatedPayload<PayPeriod>, ValidatedForm<ValidationFailures>, never>;
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

    component.onCandidateSelect({ value: payPeriodStart });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const payPeriodFormDebugEl = fixture.debugElement.query(By.directive(PayPeriodForm));
    const payPeriodForm = payPeriodFormDebugEl.componentInstance as PayPeriodForm;

    //Arrange: add 4 rows with valid data
    for (let i = 0; i < 4; i++) payPeriodForm.addRow();
    const rows = payPeriodForm.hoursWorkedArray;
    rows.at(0).patchValue({ workDate: '2010-01-02', startDateTime: '08:00', endDateTime: '12:00' });
    rows.at(1).patchValue({ workDate: '2010-01-03', startDateTime: '09:00', endDateTime: '17:00' });
    rows.at(2).patchValue({ workDate: '2010-01-04', startDateTime: '10:00', endDateTime: '18:00' });
    rows.at(3).patchValue({ workDate: '2010-01-05', startDateTime: '07:00', endDateTime: '15:00' });
    fixture.detectChanges();

    //Act: submit — server returns validation failures
    payPeriodForm.formGroup().markAllAsTouched();
    payPeriodForm.onSubmit();
    await fixture.whenStable();
    fixture.detectChanges();

    //Assert: row 0 has a startDateTime error
    expect(rows.at(0).get('startDateTime')?.errors).toMatchObject({ 'server-side': row0Error });
    expect(rows.at(0).get('endDateTime')?.errors).toBeNull();

    //Assert: row 1 has no errors
    expect(rows.at(1).get('startDateTime')?.errors).toBeNull();
    expect(rows.at(1).get('endDateTime')?.errors).toBeNull();

    //Assert: row 2 has an endDateTime error
    expect(rows.at(2).get('startDateTime')?.errors).toBeNull();
    expect(rows.at(2).get('endDateTime')?.errors).toMatchObject({ 'server-side': row2Error });

    //Assert: row 3 has no errors
    expect(rows.at(3).get('startDateTime')?.errors).toBeNull();
    expect(rows.at(3).get('endDateTime')?.errors).toBeNull();

    //Assert: error messages appear in the rendered HTML at the correct rows
    const tableRows = fixture.nativeElement.querySelectorAll('p-table tr');
    expect(tableRows[1].querySelector('p-message')?.textContent).toContain(row0Error);
    expect(tableRows[2].querySelector('p-message')).toBeNull();
    expect(tableRows[3].querySelector('p-message')?.textContent).toContain(row2Error);
    expect(tableRows[4].querySelector('p-message')).toBeNull();
  });
});
