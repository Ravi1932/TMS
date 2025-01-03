import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PodReportPage } from './pod-report.page';

const routes: Routes = [
  {
    path: '',
    component: PodReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PodReportPageRoutingModule {}
