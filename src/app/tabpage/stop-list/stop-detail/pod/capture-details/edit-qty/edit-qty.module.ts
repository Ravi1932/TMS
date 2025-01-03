import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditQtyPageRoutingModule } from './edit-qty-routing.module';

import { EditQtyPage } from './edit-qty.page';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditQtyPageRoutingModule,
    ReactiveFormsModule,TranslateModule
  ],
  declarations: [EditQtyPage]
})
export class EditQtyPageModule {}
