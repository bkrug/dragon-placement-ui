import { Routes } from '@angular/router';
import { DragonSearch } from './dragon-search/dragon-search';
import { Counter } from './counter/counter';
import { PopoverDatatableDemo } from "./ability-table/ability-table";

export const routes: Routes = [
  {
    path: 'dragon-search',
    component: DragonSearch
  },
  {
    path: 'counter',
    component: Counter
  },
  {
    path: 'ability-table',
    component: PopoverDatatableDemo
  }
];
