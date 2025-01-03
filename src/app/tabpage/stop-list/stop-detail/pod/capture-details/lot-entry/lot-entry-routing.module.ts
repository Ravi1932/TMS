import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LotEntryPage } from './lot-entry.page';

const routes: Routes = [
  {
    path: '',
    component: LotEntryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LotEntryPageRoutingModule {}
