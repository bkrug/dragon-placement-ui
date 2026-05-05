import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'unixSeconds',
})
export class UnixSecondsPipe implements PipeTransform {
  transform(value: number): Date {
    return new Date(value * 1000);
  }
}