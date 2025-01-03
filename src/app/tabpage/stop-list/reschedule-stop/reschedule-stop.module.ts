import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RescheduleStopPageRoutingModule } from './reschedule-stop-routing.module';

import { RescheduleStopPage } from './reschedule-stop.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RescheduleStopPageRoutingModule,
    TranslateModule,
    FormsModule,
  ],
  declarations: [RescheduleStopPage]
})
export class RescheduleStopPageModule {}
