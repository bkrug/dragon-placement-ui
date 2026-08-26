import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Params } from '@angular/router';
import { WorkRequestClient } from '../../../httpClients/work-request-http-client';
import { CreateCustomerAndWorkRequest, WorkRequestCreateEdit } from '../../../poco/endpoint-request-bodies';
import { Customer, WorkRequest } from '../../../poco/models';
import { EntityFormBase } from '../../local-form/entity-form-base';
import { LocalNumberField, LocalSelectField, LocalStringDateField, LocalSubmitButton, LocalTextAreaField, LocalTextField, SelectListOption } from '../../local-form/local-fields';

@Component({
  selector: 'app-work-request-form',
  imports: [ ReactiveFormsModule, LocalTextField, LocalTextAreaField, LocalStringDateField, LocalNumberField, LocalSelectField, LocalSubmitButton ],
  templateUrl: './work-request-form.html',
  styleUrl: './work-request-form.scss',
})
export class WorkRequestForm extends EntityFormBase<WorkRequest> implements OnInit, OnDestroy {
  httpClient = inject(WorkRequestClient);

  private routeParams: Params = {};

  get customerId(): string | null { return this.formGroup().get('customerId')?.value || null; }
  get urlCustomerName(): string { return this.routeParams['customerName'] || ''; }

  constructor() {
    super('workRequestId');
  }

  customers = signal<SelectListOption[]>([]);

  ngOnInit(): void {
    this.setCutomerIdField();

    this.httpClient.searchCustomers('', 20)
      .subscribe(validatedResponse => {
        let loadedOptions =
          ([ { display: '<New Cutomer>', value: null } ] as SelectListOption[])
          .concat(validatedResponse.payload.map(this.toSelectOption));
        this.customers.set(loadedOptions);
        this.setCutomerIdField();
      });

    if (this.entityId)
      this.httpClient.getWorkRequest(this.entityId)
        .subscribe(validatedResponse => {
          this.formGroup.set(this.getFormGroup(validatedResponse.payload));
          this.formGroup().get('customerId')?.setValue(this.customerId);
        });
  }

  private setCutomerIdField() {
    if (this.routeParams['customerId'])
      this.formGroup().get('customerId')?.setValue(this.routeParams['customerId']);
  }

  toSelectOption(customer: Customer): SelectListOption {
    return { display: customer.name, value: String(customer.customerId) };
  }

  ngOnDestroy(): void {
    this.httpClient.unsubscribe();
  }

  get isCustomerNameEditable(): boolean {
    return !this.formGroup().get('customerId')?.value && !this.entityId;
  }

  get isCustomerChangeable(): boolean {
    return !this.entityId;
  }

  private getFormGroup(payload: WorkRequest) {
    const initialCustomerName = this.entityId ? payload.customer.name : this.urlCustomerName;
    return new FormGroup({
      customerName: new FormControl(initialCustomerName),
      customerId: new FormControl<string | null>(null),
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
