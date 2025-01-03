import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LitigationPage } from './litigation.page';

const routes: Routes = [
  {
    path: '',
    component: LitigationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LitigationPageRoutingModule {}
