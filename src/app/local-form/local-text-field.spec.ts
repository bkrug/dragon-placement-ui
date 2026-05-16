import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalTextField } from './local-fields';

describe('LocalTextField', () => {
  let component: LocalTextField;
  let fixture: ComponentFixture<LocalTextField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalTextField],
    }).compileComponents();

    fixture = TestBed.createComponent(LocalTextField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
