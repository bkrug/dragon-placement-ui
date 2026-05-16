import { Routes } from '@angular/router';
import { AbilityTable } from './ability-table/ability-table';
import { Counter } from './counter/counter';
import { DragonForm } from './dragon-form/dragon-form';
import { DragonList } from './dragon-list/dragon-list';
import { DragonView } from './dragon-view/dragon-view';
import { Home } from './home/home';
import { JobList } from './job-list/job-list';

export const routes: Routes = [
  {
    path: 'counter',
    component: Counter
  },
  {
    path: 'ability-table',
    component: AbilityTable
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
