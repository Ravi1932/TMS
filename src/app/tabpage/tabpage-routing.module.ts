import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabPage } from './tabpage.page';

const routes: Routes = [
  {
    path: '',
    component: TabPage,
    children: [{
      path: 'dashboard',
      loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardPageModule)
    },
    {
      path: 'routes',
      loadChildren: () => import('./routes/routes.module').then(m => m.RoutesPageModule)
    },
    {
      path: 'stop-list',
      loadChildren: () => import('./stop-list/stop-list.module').then(m => m.StopListPageModule)
    },
    {
      path: 'map',
      loadChildren: () => import('./map/map.module').then(m => m.MapPageModule)
    },
    {
      path: 'layout',
      loadChildren: () => import('./layout/layout.module').then(m => m.LayoutPageModule)
    },
    {
      path: '',
      redirectTo: 'layout',
      pathMatch: 'full'
    },
    {
      path: 'route-settlement',
      loadChildren: () => import('./route-settlement/route-settlement.module').then(m => m.RouteSettlementPageModule)
    }
    ]
  }]
  ;

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabPageRoutingModule { }
