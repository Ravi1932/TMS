import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-sync-data-modal',
  templateUrl: './sync-data-modal.component.html',
  styleUrls: ['./sync-data-modal.component.scss'],
})
export class SyncDataModalComponent implements OnInit {
  constructor(private router: Router,
    private modalController: ModalController,
  ) { }

  ngOnInit() { }

  onSync() {
    this.modalController.dismiss();
    this.router.navigate(['tabs/layout/sync-data']);
  }
  dismiss() {
    this.modalController.dismiss();
  }
}
