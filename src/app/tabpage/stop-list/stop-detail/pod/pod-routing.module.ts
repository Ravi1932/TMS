import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PodPage } from './pod.page';

const routes: Routes = [
  {
    path: '',
    component: PodPage
  },
  {
    path: 'capture-details',
    loadChildren: () => import('./capture-details/capture-details.module').then(m => m.CaptureDetailsPageModule)
  },  {
    path: 'invoice',
    loadChildren: () => import('./invoice/invoice.module').then( m => m.InvoicePageModule)
  },
  {
    path: 'payment',
    loadChildren: () => import('./payment/payment.module').then( m => m.PaymentPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PodPageRoutingModule { }
