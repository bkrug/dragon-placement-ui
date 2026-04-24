import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MuchMath } from '../much-math/much-math';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-counter',
  imports: [ FormsModule, DecimalPipe, MuchMath, ButtonModule ],
  templateUrl: './counter.html',
  styleUrl: './counter.scss',
})
export class Counter {
  count: number = 0;
  step: number = 1;
  array1: number[] = [ ];
  adjust() : void {
    this.array1.push(this.count);
    this.count += this.step;
  }
}
