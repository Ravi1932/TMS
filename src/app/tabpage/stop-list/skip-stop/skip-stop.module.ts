import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SkipStopPageRoutingModule } from './skip-stop-routing.module';

import { SkipStopPage } from './skip-stop.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SkipStopPageRoutingModule,
    TranslateModule
  ],
  declarations: [SkipStopPage]
})
export class SkipStopPageModule {}
