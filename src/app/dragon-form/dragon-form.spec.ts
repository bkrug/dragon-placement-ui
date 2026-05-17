import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragonForm } from './dragon-form';

describe('DragonForm', () => {
  let component: DragonForm;
  let fixture: ComponentFixture<DragonForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragonForm],
    }).compileComponents();

    fixture = TestBed.createComponent(DragonForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(1).toBe(1);
    expect(component).toBeTruthy();
  });
});
