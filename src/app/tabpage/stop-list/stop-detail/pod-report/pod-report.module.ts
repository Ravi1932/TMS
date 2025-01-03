import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PodReportPageRoutingModule } from './pod-report-routing.module';

import { PodReportPage } from './pod-report.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PodReportPageRoutingModule,TranslateModule
  ],
  declarations: [PodReportPage]
})
export class PodReportPageModule {}
