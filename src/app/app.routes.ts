import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Counter } from './counter/counter';
import { PopoverDatatableDemo } from "./ability-table/ability-table";
import { JobList } from './job-list/job-list';
import { DragonView } from './dragon-view/dragon-view';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'counter',
    component: Counter
  },
  {
    path: 'ability-table',
    component: PopoverDatatableDemo
  },
  {
    path: 'jobs',
    component: JobList
  },
  {
    path: 'dragons/:dragonId',
    component: DragonView
  }
];
