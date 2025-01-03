import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { GuestGuard } from './shared/guards/guest.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full'
  },
  // {
  //   path: 'home',
  //   loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
  //   canActivate: [AuthGuard],
  // },
  {
    path: 'login',
    loadChildren: () => import('./auth/login/login.module').then(m => m.LoginPageModule),
    canActivate: [GuestGuard]
  },
  {
    path: 'configuration',
    loadChildren: () => import('./configuration/configuration.module').then(m => m.ConfigurationPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabpage/tabpage.module').then(m => m.TabPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'ors',
    loadChildren: () => import('./ors/ors.module').then(m => m.OrsPageModule)
  },
  {
    path: 'history',
    loadChildren: () => import('./history/history.module').then(m => m.HistoryPageModule)
  },
  {
    path: 'stop-detail',
    loadChildren: () => import('./tabpage/stop-list/stop-detail/stop-detail.module').then(m => m.StopDetailPageModule)
  },
  {
    path: 'service-request',
    loadChildren: () => import('./service-request/service-request.module').then(m => m.ServiceRequestPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      paramsInheritanceStrategy: 'always',
    }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
