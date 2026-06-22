import { Directive, WritableSignal, inject, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Effect } from 'effect';
import { ValidatedForm, ValidatedPayload } from '../../poco/standard-responses';
import { applyServerSideValidations } from './local-fields';

@Directive()
export abstract class EntityFormBase<TDb extends object, TValidationFailures extends object> {
  private activatedRoute = inject(ActivatedRoute);
  protected entityId: number | null = null;

  isSubmitting = signal(false);
  showSaved = signal(false);
  submissionError = signal('');
  overrideInvalidForm = signal(false);

  constructor(idParamName: string) {
    this.activatedRoute.params.subscribe(params => {
      this.entityId = params[idParamName] || null;
    });
  }

  abstract formGroup: WritableSignal<FormGroup>;

  protected abstract makeSubmissionRequest(): Promise<Effect.Effect<ValidatedPayload<TDb>, ValidatedForm<TValidationFailures>, never>>;
  protected abstract handleSubmissionSuccess(payload: TDb): void;

  onFormFocus() {
    this.showSaved.set(false);
    this.submissionError.set('');
  }

  onSubmit() {
    if (this.formGroup().valid || this.overrideInvalidForm()) {
      this.isSubmitting.set(true);
      this.showSaved.set(false);
      this.makeSubmissionRequest()
        .then(result =>
          Effect.runPromise(Effect.match(result, {
            onSuccess: successResponse => {
              this.handleSubmissionSuccess(successResponse.payload);
              this.showSaved.set(true);
            },
            onFailure: failureResponse => failureResponse.isInternalError
              ? this.submissionError.set('failed communication with the remote server')
              : applyServerSideValidations(failureResponse, this.formGroup())
          }))
        )
        .finally(() => this.isSubmitting.set(false));
    }
  }
}
