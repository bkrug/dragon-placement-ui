import { Routes } from '@angular/router';
import { AbilityTable } from './pages/ability-table/ability-table';
import { Counter } from './pages/counter/counter';
import { DragonForm } from './pages/dragon-form/dragon-form';
import { DragonList } from './pages/dragon-list/dragon-list';
import { DragonView } from './pages/dragon-view/dragon-view';
import { Home } from './pages/home/home';
import { HoursWorkedForm } from './pages/hours-worked-form/hours-worked-form';
import { HoursWorkedList } from './pages/hours-worked-list/hours-worked-list';
import { JobForm } from './pages/job-form/job-form';
import { JobList } from './pages/job-list/job-list';
import { ManageJob } from './pages/manage-job/manage-job';
import { PayPeriodCreate } from './pages/pay-period-create/pay-period-create';
import { PayPeriodList } from './pages/pay-period-list/pay-period-list';

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
    path: 'jobs-manage/:jobId',
    component: ManageJob
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
    path: 'dragons/:dragonId/assignments/:assignmentId/hours-worked',
    component: HoursWorkedList
  },
  {
    path: 'hours-worked-form/:hoursWorkedId',
    component: HoursWorkedForm
  },
  {
    path: 'dragons/:dragonId/assignments/:assignmentId/hours-worked-form',
    component: HoursWorkedForm
  },
  {
    path: 'dragons/:dragonId/assignments/:assignmentId/pay-periods',
    component: PayPeriodList
  },
  {
    path: 'dragons/:dragonId/assignments/:assignmentId/pay-period-create',
    component: PayPeriodCreate
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
