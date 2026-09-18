import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Counter } from './counter';

describe('Counter', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Counter],
    }).compileComponents();
  });

  function getFixture() {
    return TestBed.createComponent(Counter);
  }

  async function getComponent(fixture: ComponentFixture<Counter>) {
    const component = fixture.componentInstance;
    await fixture.whenStable();
    return component;
  }

  it('Increment button should cause the number in a text message to increase by one', async () => {
    const fixture = getFixture();
    const component = await getComponent(fixture);
    const nativeElement:HTMLElement = fixture.nativeElement;

    //Act
    expect(component).toBeTruthy();
    const curretnValueP = nativeElement.querySelector('#current-value');
    const incrementBtn = fixture.debugElement.query(By.css('#increment-button'));
    expect(curretnValueP?.textContent).toEqual('Current value 0');
    incrementBtn.triggerEventHandler('click');
    await fixture.whenStable();

    expect(curretnValueP?.textContent).toEqual('Current value 1');
    incrementBtn.triggerEventHandler('click');
    await fixture.whenStable();

    expect(curretnValueP?.textContent).toEqual('Current value 2');
  });

  it('Increment button should cause the number in a text message to increase by whatever number is reflected in the "step" input.', async () => {
    const fixture = getFixture();
    const component = await getComponent(fixture);
    const nativeElement:HTMLElement = fixture.nativeElement;

    //Act
    expect(component).toBeTruthy();
    const curretnValueP = nativeElement.querySelector('#current-value');
    const incrementBtn = fixture.debugElement.query(By.css('#increment-button'));
    expect(curretnValueP?.textContent).toEqual('Current value 0');
    component.step = 3;
    incrementBtn.triggerEventHandler('click');
    await fixture.whenStable();

    expect(curretnValueP?.textContent).toEqual('Current value 3');
    incrementBtn.triggerEventHandler('click');
    await fixture.whenStable();

    expect(curretnValueP?.textContent).toEqual('Current value 6');
  });

  it('The sum of two numbers should be displayed', async () => {
    const fixture = getFixture();
    const component = await getComponent(fixture);
    const nativeElement:HTMLElement = fixture.nativeElement;

    //Act
    expect(component).toBeTruthy();
    const sumOfValuesP = nativeElement.querySelector('#sum-of-values');
    const incrementBtn = fixture.debugElement.query(By.css('#increment-button'));

    component.countB.set(40);
    component.step = 1;
    incrementBtn.triggerEventHandler('click');
    incrementBtn.triggerEventHandler('click');
    incrementBtn.triggerEventHandler('click');
    await fixture.whenStable();

    //By now we think that we are adding 40 + 3
    expect(sumOfValuesP?.textContent).toEqual('Sum of count and other number: 43');
  });
});
