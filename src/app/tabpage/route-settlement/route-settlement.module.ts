import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RouteSettlementPageRoutingModule } from './route-settlement-routing.module';

import { RouteSettlementPage } from './route-settlement.page';
import { TranslateModule } from '@ngx-translate/core';
import { StockComponent } from './stock/stock.component';
import { OpenStockComponent } from './open-stock/open-stock.component';
import { CloseStockComponent } from './close-stock/close-stock.component';
import { InventoryDetailComponent } from './inventory-detail/inventory-detail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouteSettlementPageRoutingModule,
    TranslateModule
  ],
  declarations: [RouteSettlementPage,StockComponent,OpenStockComponent,CloseStockComponent,InventoryDetailComponent]
})
export class RouteSettlementPageModule {}
