import { Routes } from '@angular/router';
import { AbilityTable } from './pages/ability-table/ability-table';
import { Counter } from './pages/counter/counter';
import { DragonForm } from './pages/dragon-form/dragon-form';
import { DragonList } from './pages/dragon-list/dragon-list';
import { DragonView } from './pages/dragon-view/dragon-view';
import { Home } from './pages/home/home';
import { JobList } from './pages/job-list/job-list';
import { JobForm } from './pages/job-form/job-form';

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
    path: 'jobs-form/:jobId',
    component: JobForm
  },
  {
    path: 'jobs-form',
    component: JobForm
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
