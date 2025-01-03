import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddSignaturePage } from './add-signature.page';

const routes: Routes = [
  {
    path: '',
    component: AddSignaturePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddSignaturePageRoutingModule {}
