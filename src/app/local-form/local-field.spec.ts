import { inputBinding } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LocalCheckbox } from './local-fields';

// This test doesn't really assert anything,
// but if I can think of anything to assert on these local-field components,
// then this is a good starting point.

describe('LocalCheckbox', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalCheckbox],
    }).compileComponents();
  });

  it('should create', async () => {
    const formGroup = new FormGroup({
      givenName: new FormControl('Frank', [ Validators.required ]),
    });

    const fixture = TestBed.createComponent(LocalCheckbox, {
      bindings: [
        inputBinding('id', () => 'given-name'),
        inputBinding('fieldName', () => 'givenName'),
        inputBinding('label', () => 'Given Name:'),
        inputBinding('formGroup', () => formGroup),
        inputBinding('fieldControl', () => formGroup.get('givenName'))
      ]
    });
    const component = fixture.componentInstance;
    await fixture.whenStable();

    //Assert
    expect(component).toBeTruthy();
  });
});
