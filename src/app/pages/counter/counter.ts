import { DecimalPipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MuchMath } from './much-math/much-math';

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
  countB = signal<number>(1);
  //As one might expect, computedSum only gets updated when "countB" changes, not "count".
  //The most recent value for "count" is used whenever "countB" changes.
  computedSum = computed(() => {
    return this.count + this.countB();
  });
  adjust() : void {
    this.array1.push(this.count);
    this.count += this.step;
  }
  getClasses() : string[] {
    return ['turtle', 'puppy'];
  }
  isExpanded() {
    return true;
  }
}
