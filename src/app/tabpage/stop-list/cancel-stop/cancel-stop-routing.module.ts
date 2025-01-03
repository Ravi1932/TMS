import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CancelStopPage } from './cancel-stop.page';

const routes: Routes = [
  {
    path: '',
    component: CancelStopPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CancelStopPageRoutingModule {}
