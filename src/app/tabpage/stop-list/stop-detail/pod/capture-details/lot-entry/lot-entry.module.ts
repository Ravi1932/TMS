import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LotEntryPageRoutingModule } from './lot-entry-routing.module';

import { LotEntryPage } from './lot-entry.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LotEntryPageRoutingModule,
    ReactiveFormsModule
  ],
  // declarations: [LotEntryPage]
})
export class LotEntryPageModule { }
