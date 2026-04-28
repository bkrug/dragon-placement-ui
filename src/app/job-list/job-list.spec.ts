import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobManagement } from './job-list';

describe('JobManagement', () => {
  let component: JobManagement;
  let fixture: ComponentFixture<JobManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(JobManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
