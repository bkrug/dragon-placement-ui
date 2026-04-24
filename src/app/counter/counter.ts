import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-counter',
  imports: [ FormsModule, DecimalPipe ],
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
