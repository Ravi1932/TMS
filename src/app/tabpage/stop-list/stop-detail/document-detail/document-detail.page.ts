import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { RoutesService } from 'src/app/services/routes.service';
import { UtilService } from 'src/app/services/util.service';
import { NotesDetailPage } from './notes-detail/notes-detail.page';

@Component({
  selector: 'app-document-detail',
  templateUrl: './document-detail.page.html',
  styleUrls: ['./document-detail.page.scss'],
})
export class DocumentDetailPage implements OnInit {
  detailDetId: string;
  documentDetails = [];
  from: string = "normal";
  partsDetails = [];
  constructor(
    private routesService: RoutesService,
    private route: ActivatedRoute,
    private utilService: UtilService,
    private modalController: ModalController,
    private router:Router
  ) {
    this.route.queryParams.subscribe(params => {
      if (params && params.document) {
        this.detailDetId = params.document;
        this.getDocumentDetails()
      }
      if (params && params.from && params.from === 'history') {
        this.from = 'history';
      }
    })
  }

  ngOnInit() {
    this.serviceDetailParts();
  }

  async serviceDetailParts() {
    this.routesService.getPartDetails(this.detailDetId).subscribe((resp: any) => {
      if(resp){
        this.partsDetails = resp;
      }
    }, (err: any) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    })
  }

  async getDocumentDetails() {
    await this.utilService.showLoading();
    this.routesService.getDocumentDetails(this.detailDetId).subscribe((resp: any) => {
      this.utilService.dismissLoading();
      if (!this.utilService.isOnline) {
        this.documentDetails = resp;
      } else {
        this.documentDetails = resp;
      }
    }, (err: any) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    })
  }

  async notesModal(item) {
    const modal = await this.modalController.create({
      component: NotesDetailPage,
      componentProps: { docData: item }
    });

    await modal.present();

    const data = await modal.onDidDismiss();
    if (data && data.data) {

    }
  }

  goToHome(){
    this.router.navigate(['tabs/routes']);
  }
}
