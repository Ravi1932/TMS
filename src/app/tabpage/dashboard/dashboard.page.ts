import { Component, IterableDiffers, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoutesService } from 'src/app/services/routes.service';
import { UtilService } from 'src/app/services/util.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  stopId: string;
  totalDrops;
  todayTotalDrops;
  totalPickups;
  todayTotalPickups;
  totalStops;
  documentDetails: any[] = [];
  todayDate;
  completeStops = 0;
  progress = 0;
  intervalId;
  // stopsArray: any[] = [
  //   { XDOCNUM_0: "SRTDE0120008", XDOCTYP_0: 1, XCTY_0: "one", XDLVDAT_0: "2021-07-10T11:56:52.847Z" },
  //   { XDOCNUM_0: "SRTDE0120008", XDOCTYP_0: 1, XCTY_0: "two", XDLVDAT_0: "2021-07-09T11:56:52.847Z" },
  //   { XDOCNUM_0: "SRTDE0120008", XDOCTYP_0: 1, XCTY_0: "third", XDLVDAT_0: "2021-07-09T11:56:52.847Z" },
  //   { XDOCNUM_0: "SRTDE0120008", XDOCTYP_0: 1, XCTY_0: "four", XDLVDAT_0: "2021-07-08T11:56:52.847Z" },
  //   { XDOCNUM_0: "SRTDE0120008", XDOCTYP_0: 2, XCTY_0: "five", XDLVDAT_0: "2021-07-07T11:56:52.847Z" },
  //   { XDOCNUM_0: "SRTDE0120008", XDOCTYP_0: 1, XCTY_0: "six", XDLVDAT_0: "2021-07-06T11:56:52.847Z" },
  //   { XDOCNUM_0: "SRTDE0120008", XDOCTYP_0: 2, XCTY_0: "seven", XDLVDAT_0: "2021-07-05T11:56:52.847Z" },
  //   { XDOCNUM_0: "SRTDE0120008", XDOCTYP_0: 2, XCTY_0: "eight", XDLVDAT_0: "2021-07-04T11:56:52.847Z" },
  //   { XDOCNUM_0: "SRTDE0120009", XDOCTYP_0: 1, XCTY_0: "nine", XDLVDAT_0: "2021-07-14T11:56:52.847Z" },
  //   // { XDOCNUM_0: "SRTDE0120009", XDOCTYP_0: 1, XCTY_0: "nine", XDLVDAT_0: "2021-05-10T00:00:00.000Z"},
  //   { XDOCNUM_0: "SRTDE0120009", XDOCTYP_0: 2, XCTY_0: "nine", XDLVDAT_0: "2021-07-14T11:56:52.847Z" },
  //   { XDOCNUM_0: "SRTDE0120009", XDOCTYP_0: 2, XCTY_0: "nine", XDLVDAT_0: "2021-07-14T11:56:52.847Z" },
  // ];

  constructor(
    private utilService: UtilService,
    private routesService: RoutesService,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      if (params && params.route) {
        this.stopId = params.route;
        this.getDocumentDetails();
      }
      else {
        this.utilService.getStorageData('stopId').then(data => {
          this.stopId = data;
          this.getDocumentDetails();
        });
      }
    })
  }

  ngOnInit() {
  }

  async getDocumentDetails() {
    await this.utilService.showLoading();
    this.routesService.getDocumentDetails(this.stopId).subscribe((resp: any) => {
      this.utilService.dismissLoading();
      this.documentDetails = resp;
      this.allStatus();
      this.todayStatusJob();
    }, (err: any) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    })
  }

  allStatus() {
    this.totalDrops = _.filter(this.documentDetails, { XDOCTYP_0: 1 });
    this.totalDrops = this.totalDrops.length;

    this.totalPickups = _.filter(this.documentDetails, { XDOCTYP_0: 2 })
    this.totalPickups = this.totalPickups.length

    this.totalStops = this.totalDrops + this.totalPickups;
    this.todayDate = new Date();

    // const process = () => {
    //   if (this.progress <= 99) {
    //     console.log('if', this.progress);
    //     this.progress = this.progress + (100 / this.totalStops);
    //     // if (this.totalDrops > 0) {
    //     //   this.totalDrops--;
    //     // }
    //     // if (this.totalPickups > 0) {
    //     //   this.totalPickups--;
    //     // }
    //     this.completeStops++;
    //   }
    //   else {
    //     console.log('else');
    //     clearInterval(this.intervalId)
    //   }
    // }
    // this.intervalId = setInterval(process, 1000);
  }

  // ngOnDestroy() {
  //   clearInterval(this.intervalId)
  // }

  todayStatusJob() {
    this.todayTotalDrops = _.filter(this.documentDetails, (todayDrop) => {
      return todayDrop.XDOCTYP_0 == 1 && moment(todayDrop.XDLVDAT_0).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD');
    });
    this.todayTotalDrops = this.todayTotalDrops.length;

    this.todayTotalPickups = _.filter(this.documentDetails, (todayPickup) => {
      return todayPickup.XDOCTYP_0 == 2 && moment(todayPickup.XDLVDAT_0).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD');
    });
    this.todayTotalPickups = this.todayTotalPickups.length;
  }

}
