import { ComponentFixture, TestBed } from '@angular/core/testing';

import { inputBinding } from '@angular/core';
import { MuchMath } from './much-math';

describe('MuchMath', () => {
  let component: MuchMath;
  let fixture: ComponentFixture<MuchMath>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MuchMath],
    }).compileComponents();
  });

  it('should create', async () => {
    fixture = TestBed.createComponent(MuchMath, {
      bindings: [
        inputBinding('inputNumber', () => 1.0023)
      ]
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
    const nativeElement = fixture.nativeElement as HTMLElement;

    //Act
    expect(component).toBeTruthy();
    expect(nativeElement.querySelector('p')?.textContent).toEqual('Given: 1.002 -- Double 2.0046 -- Reciprocal 0.998 -- Square: 1.00460529')
  });
});
