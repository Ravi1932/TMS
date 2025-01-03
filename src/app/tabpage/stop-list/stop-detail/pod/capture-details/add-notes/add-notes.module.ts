import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddNotesPageRoutingModule } from './add-notes-routing.module';

import { AddNotesPage } from './add-notes.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddNotesPageRoutingModule,
    TranslateModule
  ],
  declarations: [AddNotesPage]
})
export class AddNotesPageModule {}
