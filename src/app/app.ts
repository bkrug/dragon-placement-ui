import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Counter } from './counter/counter';
import { PopoverDatatableDemo } from "./ability-table/ability-table";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Counter, PopoverDatatableDemo],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('angular-pokemon-hiring');
}
