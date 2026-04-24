import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuchMath } from './much-math';

describe('MuchMath', () => {
  let component: MuchMath;
  let fixture: ComponentFixture<MuchMath>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuchMath],
    }).compileComponents();

    fixture = TestBed.createComponent(MuchMath);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
