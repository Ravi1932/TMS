import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgCircleProgressModule.forRoot({
      space: 8,
      radius: 90,
      responsive: true,
      outerStrokeWidth: 5,
      innerStrokeWidth: 18,
      outerStrokeColor: "#24a859",
      innerStrokeColor: "#166937",
      subtitle: "Overall Status",
      titleFontSize: "25",
      unitsFontSize: "25",
      subtitleFontSize: "16",
      titleFontWeight: "600",
      unitsFontWeight: "600",
      subtitleFontWeight: "600",
      titleColor: "#166937",
      unitsColor: "#166937",
      subtitleColor: "#166937",
      animation: true,
      animationDuration: 300,
    }),
    TranslateModule,
    DashboardPageRoutingModule
  ],
  declarations: [DashboardPage]
})
export class DashboardPageModule { }
