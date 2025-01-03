import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RoutesPageRoutingModule } from './routes-routing.module';

import { RoutesPage } from './routes.page';
import { TranslateModule } from '@ngx-translate/core';
import { ActionPopoverComponent } from './action-popover/action-popover.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RoutesPageRoutingModule, TranslateModule
  ],
  declarations: [RoutesPage, ActionPopoverComponent]
})
export class RoutesPageModule { }
