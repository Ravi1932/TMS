import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RouteSettlementPage } from './route-settlement.page';
import { StockComponent } from './stock/stock.component';
import { OpenStockComponent } from './open-stock/open-stock.component';
import { CloseStockComponent } from './close-stock/close-stock.component';
import { InventoryDetailComponent } from './inventory-detail/inventory-detail.component';

const routes: Routes = [
  {
    path: '',
    component: RouteSettlementPage
  },
  {
    path: 'stock',
    component: StockComponent
  },
  {
    path: 'open-stock',
    component: OpenStockComponent
  },
  {
    path: 'close-stock',
    component: CloseStockComponent
  },
  {
    path: 'inventory-detail',
    component: InventoryDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RouteSettlementPageRoutingModule { }
