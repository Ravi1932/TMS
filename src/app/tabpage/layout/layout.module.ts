import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LayoutPageRoutingModule } from './layout-routing.module';

import { LayoutPage } from './layout.page';
import { ScheduledServiceOrderComponent } from './scheduled-service-order/scheduled-service-order.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { SyncDataComponent } from './sync-data/sync-data.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LayoutPageRoutingModule,
    ReactiveFormsModule,
    NgSelectModule,
    TranslateModule
  ],
  declarations: [LayoutPage, ScheduledServiceOrderComponent, SyncDataComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class LayoutPageModule { }
