import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StopListPage } from './stop-list.page';

const routes: Routes = [
  {
    path: '',
    component: StopListPage
  },
  {
    path: 'stop-detail',
    loadChildren: () => import('./stop-detail/stop-detail.module').then( m => m.StopDetailPageModule)
  },
  {
    path: 'skip-stop',
    loadChildren: () => import('./skip-stop/skip-stop.module').then( m => m.SkipStopPageModule)
  },
  {
    path: 'cancel-stop',
    loadChildren: () => import('./cancel-stop/cancel-stop.module').then( m => m.CancelStopPageModule)
  },
  {
    path: 'reschedule-stop',
    loadChildren: () => import('./reschedule-stop/reschedule-stop.module').then( m => m.RescheduleStopPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StopListPageRoutingModule {}
