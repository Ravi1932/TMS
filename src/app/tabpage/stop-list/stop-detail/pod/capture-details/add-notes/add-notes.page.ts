import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-add-notes',
  templateUrl: './add-notes.page.html',
  styleUrls: ['./add-notes.page.scss'],
})
export class AddNotesPage implements OnInit {
  note: string = '';
  notePageData;
  constructor(
    private modalController: ModalController,
    private params: NavParams
  ) {
    this.notePageData = params.get('notePageData');
    if(this.notePageData) {
      this.note = this.notePageData;
    }
   }

  ngOnInit() {
  }

  
  save() {
    this.modalController.dismiss(this.note);
  }
  
  closeModal() {
    this.modalController.dismiss(this.note);
  }
}
