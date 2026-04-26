import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragonSearch } from './dragon-search';

describe('DragonSearch', () => {
  let component: DragonSearch;
  let fixture: ComponentFixture<DragonSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragonSearch],
    }).compileComponents();

    fixture = TestBed.createComponent(DragonSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
