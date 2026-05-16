import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Counter } from './counter/counter';
import { PopoverDatatableDemo } from './ability-table/ability-table';
import { JobList } from './job-list/job-list';
import { DragonView } from './dragon-view/dragon-view';
import { DragonList } from './dragon-list/dragon-list';
import { DragonForm } from './dragon-form/dragon-form';

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
  },
  {
    path: 'dragons-form/:dragonId',
    component: DragonForm
  },
  {
    path: 'dragons-form',
    component: DragonForm
  },
  {
    path: 'dragons/:dragonId',
    component: DragonView
  },
  {
    path: 'dragons',
    component: DragonList
  },
  {
    path: '',
    component: Home
  }
];
