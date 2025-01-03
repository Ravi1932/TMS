import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LitigationPageRoutingModule } from './litigation-routing.module';

import { LitigationPage } from './litigation.page';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSoapModule } from 'ngx-soap';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LitigationPageRoutingModule,
    ReactiveFormsModule,
    TranslateModule,
    NgxSoapModule
  ],
  declarations: [LitigationPage]
})
export class LitigationPageModule { }
