import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JobCardAddPage } from './job-card-add.page';

const routes: Routes = [
  {
    path: '',
    component: JobCardAddPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobCardAddPageRoutingModule {}
