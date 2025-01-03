import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotesDetailPageRoutingModule } from './notes-detail-routing.module';

import { NotesDetailPage } from './notes-detail.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NotesDetailPageRoutingModule,
    TranslateModule
  ],
  declarations: [NotesDetailPage]
})
export class NotesDetailPageModule {}
