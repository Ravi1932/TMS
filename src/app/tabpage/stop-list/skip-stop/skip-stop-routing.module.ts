import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SkipStopPage } from './skip-stop.page';

const routes: Routes = [
  {
    path: '',
    component: SkipStopPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SkipStopPageRoutingModule {}
