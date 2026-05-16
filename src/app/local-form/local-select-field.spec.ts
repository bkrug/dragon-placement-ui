import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalSelectField } from '../local-select-field/local-select-field';

describe('LocalSelectField', () => {
  let component: LocalSelectField;
  let fixture: ComponentFixture<LocalSelectField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalSelectField],
    }).compileComponents();

    fixture = TestBed.createComponent(LocalSelectField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
