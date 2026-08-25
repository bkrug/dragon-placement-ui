import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { WorkRequestClient } from '../../../httpClients/work-request-http-client';
import { CreateCustomerAndWorkRequest, WorkRequestCreateEdit } from '../../../poco/endpoint-request-bodies';
import { WorkRequest } from '../../../poco/models';
import { EntityFormBase } from '../../local-form/entity-form-base';
import { LocalNumberField, LocalStringDateField, LocalSubmitButton, LocalTextField } from '../../local-form/local-fields';

@Component({
  selector: 'app-work-request-form',
  imports: [ ReactiveFormsModule, LocalTextField, LocalStringDateField, LocalNumberField, LocalSubmitButton ],
  templateUrl: './work-request-form.html',
  styleUrl: './work-request-form.scss',
})
export class WorkRequestForm extends EntityFormBase<WorkRequest> implements OnInit, OnDestroy {
  httpClient = inject(WorkRequestClient);
  private route = inject(ActivatedRoute);

  private routeParams: Params = {};
  private routeParamsSubscription = this.route.params.subscribe(params => this.routeParams = params);

  get customerId(): number | null { return this.routeParams['customerId'] || null; }
  get urlCustomerName(): string { return this.routeParams['customerName'] || ''; }

  constructor() {
    super('workRequestId');
  }

  ngOnInit(): void {
    if (this.entityId)
      this.httpClient.getWorkRequest(this.entityId)
        .subscribe(validatedResponse => {
          this.formGroup.set(this.getFormGroup(validatedResponse.payload));
        });
  }

  ngOnDestroy(): void {
    this.httpClient.unsubscribe();
  }

  get isCustomerNameEditable(): boolean {
    return !this.customerId && !this.entityId;
  }

  private getFormGroup(payload: WorkRequest) {
    const initialCustomerName = this.entityId ? payload.customer.name : this.urlCustomerName;
    return new FormGroup({
      customerName: new FormControl(initialCustomerName, [ Validators.required ]),
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
      const body = {
        name: values.name!,
        description: values.description || '',
        estimatedStartDate: values.estimatedStartDate,
        estimatedEndDate: values.estimatedEndDate,
        estimatedWorkforceSize: values.estimatedWorkforceSize!,
      } as WorkRequestCreateEdit;
      return this.httpClient.postWorkRequestForm(this.customerId!, body);
    }
  }

  protected override handleSubmissionSuccess(payload: WorkRequest) {
    this.entityId = payload.workRequestId;
  }
}
