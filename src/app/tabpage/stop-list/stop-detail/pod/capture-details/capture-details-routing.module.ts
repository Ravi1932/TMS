import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CaptureDetailsPage } from './capture-details.page';
import { PreviewComponent } from './preview/preview.component';

const routes: Routes = [
  {
    path: '',
    component: CaptureDetailsPage
  },
  {
    path: 'add-notes',
    loadChildren: () => import('./add-notes/add-notes.module').then(m => m.AddNotesPageModule)
  },
  {
    path: 'add-signature',
    loadChildren: () => import('./add-signature/add-signature.module').then(m => m.AddSignaturePageModule)
  },
  {
    path: 'edit-qty',
    loadChildren: () => import('./edit-qty/edit-qty.module').then(m => m.EditQtyPageModule)
  },
  {
    path: 'litigation',
    loadChildren: () => import('./litigation/litigation.module').then(m => m.LitigationPageModule)
  },
  {
    path: 'lot-entry',
    loadChildren: () => import('./lot-entry/lot-entry.module').then(m => m.LotEntryPageModule)
  },
  {
    path: 'job-card-add',
    loadChildren: () => import('./job-card-add/job-card-add.module').then(m => m.JobCardAddPageModule)
  },
  {
    path: 'job-card-detail',
    loadChildren: () => import('./job-card-detail/job-card-detail.module').then(m => m.JobCardDetailPageModule)
  },
  {
    path: 'add-product',
    loadChildren: () => import('./add-product/add-product.module').then(m => m.AddProductPageModule)
  },
  {
    path: 'customer-survey',
    loadChildren: () => import('./customer-survey/customer-survey.module').then(m => m.CustomerSurveyModule)
  },
  {
    path:'preview',
    component:PreviewComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaptureDetailsPageRoutingModule { }
