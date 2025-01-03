import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JobCardDetailPageRoutingModule } from './job-card-detail-routing.module';

import { JobCardDetailPage } from './job-card-detail.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JobCardDetailPageRoutingModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [JobCardDetailPage]
})
export class JobCardDetailPageModule { }
