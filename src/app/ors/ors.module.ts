import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrsPageRoutingModule } from './ors-routing.module';

import { OrsPage } from './ors.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrsPageRoutingModule,TranslateModule
  ],
  declarations: [OrsPage]
})
export class OrsPageModule {}
