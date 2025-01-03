import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LayoutPage } from './layout.page';
import { ScheduledServiceOrderComponent } from './scheduled-service-order/scheduled-service-order.component';
import { SyncDataComponent } from './sync-data/sync-data.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutPage
  },
  {
    path: 'scheduled-service-order',
    component: ScheduledServiceOrderComponent
  },
  {
    path: 'sync-data',
    component: SyncDataComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutPageRoutingModule { }
