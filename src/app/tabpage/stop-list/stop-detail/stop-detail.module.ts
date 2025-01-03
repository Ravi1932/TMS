import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StopDetailPageRoutingModule } from './stop-detail-routing.module';

import { StopDetailPage } from './stop-detail.page';
import { ActionPopoverComponent } from './action-popover/action-popover.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StopDetailPageRoutingModule,TranslateModule
  ],
  declarations: [StopDetailPage, ActionPopoverComponent]
})
export class StopDetailPageModule { }
