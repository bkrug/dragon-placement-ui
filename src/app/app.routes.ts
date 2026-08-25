import { Routes } from '@angular/router';
import { Counter } from './pages/counter/counter';
import { DragonForm } from './pages/dragon-form/dragon-form';
import { DragonList } from './pages/dragon-list/dragon-list';
import { DragonView } from './pages/dragon-view/dragon-view';
import { Home } from './pages/home/home';
import { JobForm } from './pages/job-form/job-form';
import { JobList } from './pages/job-list/job-list';
import { ManageJob } from './pages/manage-job/manage-job';
import { PayPeriodCreate } from './pages/pay-period-create/pay-period-create';
import { PayPeriodForm } from './pages/pay-period-form/pay-period-form';
import { PayPeriodList } from './pages/pay-period-list/pay-period-list';
import { WorkRequestForm } from './pages/work-request-form/work-request-form';
import { WorkRequestList } from './pages/work-request-list/work-request-list';

export const routes: Routes = [
  {
    path: 'counter',
    component: Counter
  },
  {
    path: 'jobs',
    component: JobList
  },
  {
    path: 'work-requests',
    component: WorkRequestList
  },
  {
    path: 'work-request-form/create/:customerId/:customerName',
    component: WorkRequestForm
  },
  {
    path: 'work-request-form/create',
    component: WorkRequestForm
  },
  {
    path: 'work-request-form/:workRequestId',
    component: WorkRequestForm
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
    path: 'dragons/:dragonId/assignments/:assignmentId/pay-periods',
    component: PayPeriodList
  },
  {
    path: 'dragons/:dragonId/assignments/:assignmentId/pay-period-create',
    component: PayPeriodCreate
  },
  {
    path: 'pay-periods-form/:payPeriodId',
    component: PayPeriodForm
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
