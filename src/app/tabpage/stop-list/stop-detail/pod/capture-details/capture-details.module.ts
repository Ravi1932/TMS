import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CaptureDetailsPageRoutingModule } from './capture-details-routing.module';

import { CaptureDetailsPage } from './capture-details.page';
import { NgxSoapModule } from 'ngx-soap';
import { TranslateModule } from '@ngx-translate/core';
import { LotEntryPage } from './lot-entry/lot-entry.page';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PreviewComponent } from './preview/preview.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxSoapModule,
    CaptureDetailsPageRoutingModule,
    ReactiveFormsModule, TranslateModule,
    PdfViewerModule
  ],
  declarations: [CaptureDetailsPage, LotEntryPage,PreviewComponent]
})
export class CaptureDetailsPageModule { }
