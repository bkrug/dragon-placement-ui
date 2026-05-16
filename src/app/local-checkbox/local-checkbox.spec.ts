import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalCheckbox } from './local-checkbox';

describe('LocalCheckbox', () => {
  let component: LocalCheckbox;
  let fixture: ComponentFixture<LocalCheckbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalCheckbox],
    }).compileComponents();

    fixture = TestBed.createComponent(LocalCheckbox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
