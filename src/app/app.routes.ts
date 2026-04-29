import { Routes } from '@angular/router';
import { Counter } from './counter/counter';
import { PopoverDatatableDemo } from "./ability-table/ability-table";
import { JobList } from './job-list/job-list';

export const routes: Routes = [
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
  }
];
