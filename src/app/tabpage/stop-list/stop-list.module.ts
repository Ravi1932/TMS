import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StopListPageRoutingModule } from './stop-list-routing.module';

import { StopListPage } from './stop-list.page';
import { TranslateModule } from '@ngx-translate/core';
import { ActionPopoverComponent } from './action-popover/action-popover.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StopListPageRoutingModule,
    TranslateModule
  ],
  declarations: [StopListPage, ActionPopoverComponent]
})
export class StopListPageModule { }
