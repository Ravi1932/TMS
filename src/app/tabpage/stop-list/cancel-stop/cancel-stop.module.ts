import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CancelStopPageRoutingModule } from './cancel-stop-routing.module';

import { CancelStopPage } from './cancel-stop.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CancelStopPageRoutingModule,
    TranslateModule
  ],
  declarations: [CancelStopPage]
})
export class CancelStopPageModule {}
