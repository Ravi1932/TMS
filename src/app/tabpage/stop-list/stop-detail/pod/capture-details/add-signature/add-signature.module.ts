import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddSignaturePageRoutingModule } from './add-signature-routing.module';

import { AddSignaturePage } from './add-signature.page';
import { IonicRatingComponentModule } from 'ionic-rating-component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IonicRatingComponentModule,
    AddSignaturePageRoutingModule, TranslateModule
  ],
  declarations: [AddSignaturePage]
})
export class AddSignaturePageModule { }
