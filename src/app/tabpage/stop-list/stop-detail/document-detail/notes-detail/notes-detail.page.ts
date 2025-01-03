import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-notes-detail',
  templateUrl: './notes-detail.page.html',
  styleUrls: ['./notes-detail.page.scss'],
})
export class NotesDetailPage implements OnInit {
  note1: any = '';
  note2: any = '';
  docData: any;
  constructor(
    private modalController: ModalController,
    private params: NavParams
  ) {
    this.docData = params.get('docData');
    this.note1 = this.docData?.TEXTE1_0;
    this.note2 = this.docData?.TEXTE2_0;
  }

  ngOnInit() {
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
