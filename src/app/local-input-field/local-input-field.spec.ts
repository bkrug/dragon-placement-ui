import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalInputField } from './local-input-field';

describe('LocalInputField', () => {
  let component: LocalInputField;
  let fixture: ComponentFixture<LocalInputField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalInputField],
    }).compileComponents();

    fixture = TestBed.createComponent(LocalInputField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
