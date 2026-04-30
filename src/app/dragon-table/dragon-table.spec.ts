import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragonTable } from './dragon-table';

describe('DragonTable', () => {
  let component: DragonTable;
  let fixture: ComponentFixture<DragonTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragonTable],
    }).compileComponents();

    fixture = TestBed.createComponent(DragonTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
