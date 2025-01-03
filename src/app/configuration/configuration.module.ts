import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfigurationPageRoutingModule } from './configuration-routing.module';

import { ConfigurationPage } from './configuration.page';
import { HttpClientModule } from '@angular/common/http';
import { NgxSoapModule } from 'ngx-soap';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    NgxSoapModule,
    ConfigurationPageRoutingModule,
    TranslateModule
  ],
  declarations: [ConfigurationPage]
})
export class ConfigurationPageModule { }
