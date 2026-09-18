import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { Effect } from 'effect';
import { of } from 'rxjs';
import { WorkRequestClient } from '../../../httpClients/work-request-http-client';
import { CreateCustomerAndWorkRequest, WorkRequestCreateEdit } from '../../../poco/endpoint-request-bodies';
import { Customer, WorkRequest } from '../../../poco/models';
import { ValidatedForm, ValidatedPayload } from '../../../poco/standard-responses';
import { ValidationFailures } from '../../../poco/validation-failures';
import { getValidatedPayload } from '../../../testHelpers/get-validated-payload';
import { MockActivatedRoute } from '../../../testHelpers/MockActivatedRoute';
import { WorkRequestForm } from './work-request-form';

describe('Work Request Form Tests', () => {
  function getInputElement(nativeElement: HTMLDivElement, css: string) {
    return nativeElement.querySelector(css) as HTMLInputElement;
  }

  function mockSearchCustomers(mockHttpClient: WorkRequestClient) {
    mockHttpClient.searchCustomers = () => {
      return of(getValidatedPayload([] as Customer[]));
    };
  }

  async function getFixture(mockHttpClient: WorkRequestClient, routeParams: Params = {}) {
    const mockActivatedRoute = new MockActivatedRoute();
    mockActivatedRoute.setParams(routeParams);
    await TestBed
      .overrideComponent(WorkRequestForm, {
        set: { providers: [{ provide: WorkRequestClient, useValue: mockHttpClient }] }
      })    
      .configureTestingModule({
        imports: [ WorkRequestForm ],
        providers: [ { provide: ActivatedRoute, useValue: mockActivatedRoute } ]
      })
      .compileComponents();
    return TestBed.createComponent(WorkRequestForm);
  }

  async function getComponent(fixture: ComponentFixture<WorkRequestForm>) {
    const component = fixture.componentInstance;
    await fixture.whenStable();
    return component;
  }

  it('Create a work request along with a new customer', async () => {
    const mockHttpClient = new WorkRequestClient();
    mockSearchCustomers(mockHttpClient);
    let actualBody = new CreateCustomerAndWorkRequest();
    mockHttpClient.postCustomerWithWorkRequestForm = (body: CreateCustomerAndWorkRequest) => {
      actualBody = body;
      const validatedPayload = getValidatedPayload(new WorkRequest());
      return of(Effect.succeed(validatedPayload) as Effect.Effect<ValidatedPayload<WorkRequest>, ValidatedForm<ValidationFailures>, never>);
    };

    //Act
    const fixture = await getFixture(mockHttpClient);
    const component = await getComponent(fixture);

    //Assert: customer name field is editable
    expect(component).toBeTruthy();
    const nativeElement: HTMLDivElement = fixture.nativeElement;
    expect(getInputElement(nativeElement, '#customer-name input')).toBeTruthy();

    //Act: fill out and submit the form
    component.formGroup().get('customerName')?.setValue('The Ocean');
    component.formGroup().get('name')?.setValue('Dragon Wrangling');
    component.onSubmit();
    await fixture.whenStable();

    //Assert
    expect(actualBody.customerName).toEqual('The Ocean');
    expect(actualBody.workRequestName).toEqual('Dragon Wrangling');
  });

  it('Create a work request for an existing customer identified in the URL', async () => {
    const mockHttpClient = new WorkRequestClient();
    mockSearchCustomers(mockHttpClient);
    let actualCustomerId = 0;
    let actualBody = new WorkRequestCreateEdit();
    mockHttpClient.postWorkRequestForm = (customerId: number, body: WorkRequestCreateEdit) => {
      actualCustomerId = customerId;
      actualBody = body;
      const validatedPayload = getValidatedPayload(new WorkRequest());
      return of(Effect.succeed(validatedPayload) as Effect.Effect<ValidatedPayload<WorkRequest>, ValidatedForm<ValidationFailures>, never>);
    };

    mockHttpClient.searchCustomers = (name: string, count: number) => {
      const validatedPayload = getValidatedPayload([ { customerId: 4, name: 'The Ocean' }, { customerId: 5, name: 'The Sky' } ] as Customer[]);
      return of(validatedPayload);
    }

    //Act
    const fixture = await getFixture(mockHttpClient);
    const component = await getComponent(fixture);

    //Assert: customer name is displayed but not editable
    expect(component).toBeTruthy();
    const nativeElement: HTMLDivElement = fixture.nativeElement;

    //Act: fill out and submit the form
    component.formGroup().get('name')?.setValue('Egg Sitting');
    component.formGroup().get('customerId')?.setValue({ display: 'The Sky', id: '5' });
    component.onSubmit();
    await fixture.whenStable();

    //Assert
    expect(actualCustomerId).toEqual(5);
    expect(actualBody.name).toEqual('Egg Sitting');
  });

  it('Load an existing work request to be edited from this form', async () => {
    const recordId = 9;
    const initialDbRecord = Object.assign(new WorkRequest(), {
      workRequestId: recordId,
      customerId: 5,
      name: 'Egg Sitting',
      description: 'Sit with eggs',
      estimatedStartDate: '2010-01-01',
      estimatedEndDate: '2010-12-31',
      estimatedWorkforceSize: 2,
      customer: { customerId: 5, name: 'The Sky' }
    });

    const mockHttpClient = new WorkRequestClient();
    mockSearchCustomers(mockHttpClient);
    mockHttpClient.getWorkRequest = () => {
      return of(getValidatedPayload(initialDbRecord));
    };

    let actualRecordIdInPutRequest = 0;
    let actualBody = new WorkRequestCreateEdit();
    mockHttpClient.putWorkRequestForm = (workRequestId: number, body: WorkRequestCreateEdit) => {
      actualRecordIdInPutRequest = workRequestId;
      actualBody = body;
      const validatedPayload = getValidatedPayload(initialDbRecord);
      return of(Effect.succeed(validatedPayload) as Effect.Effect<ValidatedPayload<WorkRequest>, ValidatedForm<ValidationFailures>, never>);
    };

    //Act
    const fixture = await getFixture(mockHttpClient, { workRequestId: recordId });
    const component = await getComponent(fixture);

    //Assert: customer name is displayed but not editable, other fields are populated
    expect(component).toBeTruthy();
    const nativeElement: HTMLDivElement = fixture.nativeElement;
    expect(getInputElement(nativeElement, '#customer-name input')).toBeFalsy();
    expect(nativeElement.querySelector('#customer-name-display')?.textContent).toContain('The Sky');
    expect(getInputElement(nativeElement, '#work-request-name input').value).toEqual(initialDbRecord.name);

    //Act: change form values and submit
    component.formGroup().get('name')?.setValue('Senior Egg Sitting');
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    await fixture.whenStable();

    //Assert
    expect(actualRecordIdInPutRequest).toEqual(recordId);
    expect(actualBody.name).toEqual('Senior Egg Sitting');
  });

  it('Create a work request for an existing customer, then edit and resave it', async () => {
    const mockHttpClient = new WorkRequestClient();
    const createdWorkRequestId = 42;

    let postCallCount = 0;
    let actualPostCustomerId = 0;
    let actualPostBody = new WorkRequestCreateEdit();
    mockHttpClient.postWorkRequestForm = (customerId: number, body: WorkRequestCreateEdit) => {
      postCallCount++;
      actualPostCustomerId = customerId;
      actualPostBody = body;
      const validatedPayload = getValidatedPayload(Object.assign(new WorkRequest(), { workRequestId: createdWorkRequestId, customerId }));
      return of(Effect.succeed(validatedPayload) as Effect.Effect<ValidatedPayload<WorkRequest>, ValidatedForm<ValidationFailures>, never>);
    };

    let putCallCount = 0;
    let actualPutWorkRequestId = 0;
    let actualPutBody = new WorkRequestCreateEdit();
    mockHttpClient.putWorkRequestForm = (workRequestId: number, body: WorkRequestCreateEdit) => {
      putCallCount++;
      actualPutWorkRequestId = workRequestId;
      actualPutBody = body;
      const validatedPayload = getValidatedPayload(Object.assign(new WorkRequest(), { workRequestId }));
      return of(Effect.succeed(validatedPayload) as Effect.Effect<ValidatedPayload<WorkRequest>, ValidatedForm<ValidationFailures>, never>);
    };

    mockHttpClient.searchCustomers = (name: string, count: number) => {
      const validatedPayload = getValidatedPayload([ { customerId: 4, name: 'The Ocean' } ] as Customer[]);
      return of(validatedPayload);
    }

    //Act
    const fixture = await getFixture(mockHttpClient);
    const component = await getComponent(fixture);

    //Act: select an existing customer and submit
    component.formGroup().get('customerId')?.setValue({ display: 'The Ocean', id: '4' });
    component.formGroup().get('name')?.setValue('Dragon Wrangling');
    component.onSubmit();
    await fixture.whenStable();

    //Assert: POST was called to create the work request
    expect(postCallCount).toEqual(1);
    expect(putCallCount).toEqual(0);
    expect(actualPostCustomerId).toEqual(4);
    expect(actualPostBody.name).toEqual('Dragon Wrangling');

    //Act: edit a field and submit again
    component.formGroup().get('name')?.setValue('Dragon Wrangling, Advanced');
    component.onSubmit();
    await fixture.whenStable();

    //Assert: PUT was called to update the existing work request
    expect(putCallCount).toEqual(1);
    expect(postCallCount).toEqual(1);  //Unchanged
    expect(actualPutWorkRequestId).toEqual(createdWorkRequestId);
    expect(actualPutBody.name).toEqual('Dragon Wrangling, Advanced');
  });
});
