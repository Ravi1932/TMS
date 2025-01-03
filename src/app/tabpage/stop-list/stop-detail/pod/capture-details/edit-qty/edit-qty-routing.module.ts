import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditQtyPage } from './edit-qty.page';

const routes: Routes = [
  {
    path: '',
    component: EditQtyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditQtyPageRoutingModule {}
