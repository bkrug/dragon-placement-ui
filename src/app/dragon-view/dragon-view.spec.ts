import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragonView } from './dragon-view';

describe('DragonView', () => {
  let component: DragonView;
  let fixture: ComponentFixture<DragonView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragonView],
    }).compileComponents();

    fixture = TestBed.createComponent(DragonView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
