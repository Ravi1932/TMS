import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabPageRoutingModule } from './tabpage-routing.module';

import { TabPage } from './tabpage.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabPageRoutingModule,
    TranslateModule
  ],
  declarations: [TabPage]
})
export class TabPageModule { }
