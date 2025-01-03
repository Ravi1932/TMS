import { Component, OnInit } from '@angular/core';
import { RoutesService } from '../services/routes.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  documents: any = [];
  filteredDocuments: any = [];

  constructor(
    private utilService: UtilService,
    private routesService: RoutesService
  ) {
    this.getHistory();
  }

  ngOnInit() {
  }

  async getHistory() {
    const driverId = localStorage.getItem('podDriverId');
    await this.utilService.showLoading();
    this.routesService.getHistory(driverId).subscribe((res: any) => {
      this.documents = res;
      this.filteredDocuments = res;
      this.utilService.setStorageData('history', this.documents);
      this.utilService.dismissLoading();
    }, (err: any) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    });
  }

  searchDocument(e) {
    if (e.detail.value) {
      const search = e.detail.value.toLowerCase();
      this.filteredDocuments = this.documents.filter(f => f.SDHNUM_0.toLowerCase().includes(search) || f.LANMES_0.toLowerCase().includes(search) || f.XDRN_0.toLowerCase().includes(search) || f.STOFCY_0.toLowerCase().includes(search) || f.BPDNAM_0.toLowerCase().includes(search) || f.BPCORD_0.toLowerCase().includes(search) || f.BPDCTY_0.toLowerCase().includes(search));
    } else {
      this.filteredDocuments = this.documents;
    }
  }
}
