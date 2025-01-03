import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RescheduleStopPage } from './reschedule-stop.page';

const routes: Routes = [
  {
    path: '',
    component: RescheduleStopPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RescheduleStopPageRoutingModule {}
