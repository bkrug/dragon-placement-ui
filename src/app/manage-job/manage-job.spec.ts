import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageJob } from './manage-job';

//TODO: Add tests that assert what happens when a dragon is added or deleted from a job

describe('ManageJob', () => {
  let component: ManageJob;
  let fixture: ComponentFixture<ManageJob>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageJob],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageJob);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
