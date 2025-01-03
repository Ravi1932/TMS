import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StopDetailPage } from './stop-detail.page';

const routes: Routes = [
  {
    path: '',
    component: StopDetailPage
  },
  {
    path: 'document-detail',
    loadChildren: () => import('./document-detail/document-detail.module').then( m => m.DocumentDetailPageModule)
  },
  {
    path: 'pod',
    loadChildren: () => import('./pod/pod.module').then( m => m.PodPageModule)
  },
  {
    path: 'pod-report',
    loadChildren: () => import('./pod-report/pod-report.module').then( m => m.PodReportPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StopDetailPageRoutingModule {}
