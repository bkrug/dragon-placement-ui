import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, switchMap } from 'rxjs';
import { WorkRequestClient } from '../../../httpClients/work-request-http-client';
import { CreateCustomerAndWorkRequest, WorkRequestCreateEdit } from '../../../poco/endpoint-request-bodies';
import { Customer, WorkRequest } from '../../../poco/models';
import { EntityFormBase } from '../../local-form/entity-form-base';
import { LocalCustomerIdField, LocalNumberField, LocalStringDateField, LocalSubmitButton, LocalTextAreaField, LocalTextField, SelectListOption } from '../../local-form/local-fields';

@Component({
  selector: 'app-work-request-form',
  imports: [
    ReactiveFormsModule,
    LocalTextField,
    LocalTextAreaField,
    LocalStringDateField,
    LocalNumberField,
    LocalSubmitButton,
    LocalCustomerIdField
  ],
  templateUrl: './work-request-form.html',
  styleUrl: './work-request-form.scss',
})
export class WorkRequestForm extends EntityFormBase<WorkRequest> implements OnInit, OnDestroy {
  httpClient = inject(WorkRequestClient);

  get customerId(): string | null { return this.formGroup().get('customerId')?.value?.id || null; }

  constructor() {
    super('workRequestId');
  }

  ngOnInit(): void {
    if (this.entityId)
      this.httpClient.getWorkRequest(this.entityId)
        .subscribe(validatedResponse => {
          this.formGroup.set(this.getFormGroup(validatedResponse.payload));
          this.formGroup().get('customerId')?.setValue(null);
        });
  }

  toSelectOption(customer: Customer): SelectListOption {
    return { display: customer.name, id: String(customer.customerId) };
  }

  ngOnDestroy(): void {
    this.httpClient.unsubscribe();
  }

  get isCustomerNameEditable(): boolean {
    return this.formGroup().get('customerId')?.value?.id === this.NEW_CUSTOMER_ID && !this.entityId;
  }

  get isCustomerChangeable(): boolean {
    return !this.entityId;
  }

  NEW_CUSTOMER_ID = null as string | null;
  defaultOptions = [ { display: '<New Customer>', id: this.NEW_CUSTOMER_ID } ] as SelectListOption[];

  //Use the arrow pattern here so that we can pass this function as a delegate to another component
  requeryCustomers = (partialName: string) => {
    return this.httpClient.searchCustomers(partialName, 10)
      .pipe(
        map(validatedPayload => validatedPayload.payload.map(this.toSelectOption))
      );
  } 

  private getFormGroup(payload: WorkRequest) {
    const initialCustomerName = this.entityId ? payload.customer.name : '';
    return new FormGroup({
      customerId: new FormControl<SelectListOption | null>(this.defaultOptions[0] ?? null),
      customerName: new FormControl<string>(initialCustomerName),
      name: new FormControl(payload.name, [ Validators.required ]),
      description: new FormControl(payload.description),
      estimatedStartDate: new FormControl<string | null>(payload.estimatedStartDate),
      estimatedEndDate: new FormControl<string | null>(payload.estimatedEndDate),
      estimatedWorkforceSize: new FormControl(payload.estimatedWorkforceSize),
    });
  }

  formGroup = signal(this.getFormGroup(new WorkRequest()));

  protected override makeSubmissionRequest() {
    const values = this.formGroup().value;

    if (this.entityId) {
      const body = {
        name: values.name!,
        description: values.description || '',
        estimatedStartDate: values.estimatedStartDate,
        estimatedEndDate: values.estimatedEndDate,
        estimatedWorkforceSize: values.estimatedWorkforceSize!,
      } as WorkRequestCreateEdit;
      return this.httpClient.putWorkRequestForm(this.entityId, body);
    }

    console.log('customerId', this.customerId);
    if (!this.customerId) {
      const body = {
        customerName: values.customerName!,
        workRequestName: values.name!,
        description: values.description || '',
        estimatedStartDate: values.estimatedStartDate,
        estimatedEndDate: values.estimatedEndDate,
        estimatedWorkforceSize: values.estimatedWorkforceSize!,
      } as CreateCustomerAndWorkRequest;
      return this.httpClient.postCustomerWithWorkRequestForm(body);
    }
    
    else {
      let customerId = parseInt(this.customerId);
      const body = {
        name: values.name!,
        description: values.description || '',
        estimatedStartDate: values.estimatedStartDate,
        estimatedEndDate: values.estimatedEndDate,
        estimatedWorkforceSize: values.estimatedWorkforceSize!,
      } as WorkRequestCreateEdit;
      return this.httpClient.postWorkRequestForm(customerId, body);
    }
  }

  protected override handleSubmissionSuccess(payload: WorkRequest) {
    this.entityId = payload.workRequestId;
  }
}
