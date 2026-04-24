import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbilityTable } from './ability-table';

describe('AbilityTable', () => {
  let component: AbilityTable;
  let fixture: ComponentFixture<AbilityTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbilityTable],
    }).compileComponents();

    fixture = TestBed.createComponent(AbilityTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
