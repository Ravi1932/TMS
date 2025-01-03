import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomerSurveyRoutingModule } from './customer-survey-routing.module';
import { IonicModule } from '@ionic/angular';
import { CustomerSurveyComponent } from './customer-survey.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [CustomerSurveyComponent],
  imports: [
    CommonModule,
    CustomerSurveyRoutingModule,
    IonicModule,
    TranslateModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule
  ],
})
export class CustomerSurveyModule { }
