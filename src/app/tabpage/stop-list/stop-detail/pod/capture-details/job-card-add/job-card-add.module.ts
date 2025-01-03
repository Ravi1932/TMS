import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JobCardAddPageRoutingModule } from './job-card-add-routing.module';

import { JobCardAddPage } from './job-card-add.page';
import { NgxMaskModule } from 'ngx-mask';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JobCardAddPageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot()
  ],
  declarations: [JobCardAddPage],
  providers: [DatePipe]
})
export class JobCardAddPageModule { }
