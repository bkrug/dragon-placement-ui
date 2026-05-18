import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-much-math',
  imports: [ DecimalPipe ],
  templateUrl: './much-math.html',
  styleUrl: './much-math.scss',
})
export class MuchMath {
  inputNumber = input(0);
}
