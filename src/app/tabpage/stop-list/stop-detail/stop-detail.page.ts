import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { RoutesService } from 'src/app/services/routes.service';
import { UtilService } from 'src/app/services/util.service';
import { MAP_STYLES } from '../../map/map.model';
import { ActionPopoverComponent } from './action-popover/action-popover.component';
declare var google: any;
import * as moment from 'moment';
import * as _ from 'lodash';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-stop-detail',
  templateUrl: './stop-detail.page.html',
  styleUrls: ['./stop-detail.page.scss'],
})

export class StopDetailPage implements OnInit {
  googleMap: any;
  stopId: string;
  stopsDetails: any = [];
  marker;
  routeId;
  selectedStop;
  stopList: any = [];
  isStopActive: boolean = false;
  isFromHistory: boolean = false;

  constructor(
    private popoverController: PopoverController,
    private routesService: RoutesService,
    private route: ActivatedRoute,
    public utilService: UtilService,
    private router: Router,
    private translateService: TranslateService
  ) {
    this.route.queryParams.subscribe(params => {
      if (params && params.stop) {
        this.utilService.setStorageData('stopId', params.stop);
        this.stopId = params.stop;
        this.getStopsWithList();
      }
      if (params && params.from && params.from === 'history') {
        this.isFromHistory = true;
      }
    });
  }

  ngOnInit() { }
  
  async getStopsWithList() {
    let routeId = localStorage.getItem('activeRouteId');
    await this.utilService.showLoading();
    forkJoin({
      stopDetails: this.routesService.getStopsDetails(this.stopId),
      stopList: this.routesService.getStops(routeId).pipe(catchError(error => of(null)))
    }).subscribe(resp => {
      this.utilService.dismissLoading();
      if (!this.utilService.isOnline) {
        this.stopsDetails = resp.stopDetails;
        // this.stopsDetails = resp;
      } else {
        this.stopsDetails = resp.stopDetails;
      }
      this.initMap();
      const isAnyStopActive = _.filter(resp.stopList, { XISACTIVDOC_0: 2 });
      if (isAnyStopActive.length > 0) {
        this.isStopActive = true;
      } else {
        this.isStopActive = false;
      }
      this.stopList = _.sortBy(resp.stopList, 'XCSGNUM_0');
      this.selectedStop = _.find(resp.stopList, { XDOCNUM_0: this.stopId });
    }, (err: any) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    });
  }

  onPODClick(docNo) {
    this.translateService.get(['COMMON.COMPLETE_ABOVE_STEP_FIRST']).subscribe((languageRes: any) => {
      const activeStop = _.find(this.stopList, { XDOCNUM_0: docNo })?.XISACTIVDOC_0 == 0;
      if (this.isStopActive && activeStop) {
        this.utilService.showToast(languageRes['COMMON.COMPLETE_ABOVE_STEP_FIRST']);
      } else {
        if (this.selectedStop?.XCSGNUM_0 > 1) {
          const previousDocNo = this.selectedStop.XCSGNUM_0 - 1;
          let preStop = _.find(this.stopList, { XCSGNUM_0: previousDocNo });
          if (preStop && preStop.XSTATUS_0 !== 5 && preStop.XSTATUS_0 !== 6 && preStop.Sequence === '2') {
            this.utilService.showToast(languageRes['COMMON.COMPLETE_ABOVE_STEP_FIRST']);
            return false;
          } else {
            if (this.utilService.isOnline) {
              this.routesService.updateStatus(this.stopId).subscribe(res => {
                this.router.navigate(['/tabs/stop-list/stop-detail/pod'], { queryParams: { poddet: docNo } });
              });
            } else {
              this.utilService.storeApiIntoPending(`/updateStatus/${this.stopId}`, '', 'get','',this.stopId);
              this.router.navigate(['/tabs/stop-list/stop-detail/pod'], { queryParams: { poddet: docNo } });
            }
          }
        } else {
          this.router.navigate(['/tabs/stop-list/stop-detail/pod'], { queryParams: { poddet: docNo } });
        }
      }
    });
  }

  startRoute() {
    if (this.selectedStop.XCSGNUM_0 > 1) {
      const previousDocNo = this.selectedStop.XCSGNUM_0 - 1;
      let preStop = _.find(this.stopList, { XCSGNUM_0: previousDocNo });
      if (preStop && preStop.XSTATUS_0 !== 5 && preStop.XSTATUS_0 !== 6 && preStop.Sequence === '2') {
        this.translateService.get(['COMMON.COMPLETE_ABOVE_STEP_FIRST']).subscribe((languageRes: any) => {
          this.utilService.showToast(languageRes['COMMON.COMPLETE_ABOVE_STEP_FIRST']);
        });
        return false;
      } else {
        this.commonStartRouteCheck();
      }
    } else {
      this.commonStartRouteCheck();
    }
  }

  commonStartRouteCheck() {
    // if (this.selectedStop.XSTATUS_0 == 4 || this.selectedStop.XSTATUS_0 == 6) {
    //   this.translateService.get(['COMMON.ROUTE_ALREADY_STARTED']).subscribe((languageRes: any) => {
    //     this.utilService.showToast(languageRes['COMMON.ROUTE_ALREADY_STARTED']);
    //   });
    // } else {
    this.translateService.get(['COMMON.CONFIRMATION', 'COMMON.START_ROUTE_CONFIRMATION']).subscribe((languageRes: any) => {
      this.utilService.showConfirmationPopup(languageRes['COMMON.CONFIRMATION'], languageRes['COMMON.START_ROUTE_CONFIRMATION'], cb => {
        if (cb == 1) {
          const params = {
            datetime: moment().format('YYYY-MM-DDTHH:mm:ss'),
            doc: this.selectedStop.XDOCNUM_0
          }
          this.routesService.getStartRoute(params).subscribe((resp: any) => {
            if ((navigator.platform.indexOf("iPhone") != -1) ||
              (navigator.platform.indexOf("iPad") != -1) ||
              (navigator.platform.indexOf("iPod") != -1)) {
              window.open("maps://maps.google.com/maps?daddr=" + this.selectedStop.XX10A_BPGEOX_0 + "," + this.selectedStop.XX10A_BPGEOY + "&amp;ll=")
            } else {
              window.open("https://maps.google.com/maps?daddr=" + this.selectedStop.XX10A_BPGEOX_0 + "," + this.selectedStop.XX10A_BPGEOY + "&saddr=Your Location");
            }
          }, (err: any) => {
            this.utilService.showErrorCall(err);
          })
          const params1 = {
            routeId: this.routeId
          }
          this.routesService.updateStartRoute(params1).subscribe((resp: any) => {

          }, (err: any) => {
            // this.utilService.showErrorCall(err);
          })
        }
      });
    });
    // }
  }

  initMap() {
    if (this.utilService.isOnline && !this.googleMap) {
      const lat = Number(this.stopsDetails[0].XX10A_BPGEOX_0);
      const lng = Number(this.stopsDetails[0].XX10A_BPGEOY_0);
      this.googleMap = new google.maps.Map(document.getElementById('detailMapCanvas'), {
        mapTypeControl: false,
        streetViewControl: false,
        zoom: 15,
        center: { lat: lat, lng: lng },
        styles: MAP_STYLES
      });
      this.marker = new google.maps.Marker({
        map: this.googleMap,
        position: { lat: lat, lng: lng },
        icon: 'assets/images/pin-green.png',
      });
    }
  }

  async presentPopover(ev, docNo, cus_name, cus_code) {
    const activeStop = _.find(this.stopList, { XDOCNUM_0: docNo })?.XISACTIVDOC_0 == 0;
    let checkActiveStop: boolean;
    if (this.isStopActive && activeStop) {
      checkActiveStop = true;
    } else {
      checkActiveStop = false;
    }

    const popover = await this.popoverController.create({
      component: ActionPopoverComponent,
      event: ev,
      translucent: false,
      componentProps: {
        status: this.selectedStop.XSTATUS_0,
        stopId: this.selectedStop.XDOCNUM_0,
        isActiveStop: checkActiveStop,
        cus_name: cus_name,
        cus_code: cus_code
      }
    });

    await popover.present();
  }

  skipStop(docNo) {
    const messages = [
      'COMMON.COMPLETE_ACTIVE_STOP_FIRST',
      'COMMON.COMPLETE_STOP_FIRST',
      'COMMON.ALREADY_SKIPPED',
    ];
    this.translateService.get(messages).subscribe(languageRes => {
      const activeStop = _.find(this.stopList, { XDOCNUM_0: docNo }).XISACTIVDOC_0 == 0;
      if (this.isStopActive && activeStop) {
        this.utilService.showToast(languageRes['COMMON.COMPLETE_ACTIVE_STOP_FIRST']);
      } else {
        if (this.selectedStop?.XCSGNUM_0 > 1) {
          const previousDocNo = this.selectedStop.XCSGNUM_0 - 1;
          let preStop = _.find(this.stopList, { XCSGNUM_0: previousDocNo });
          if (preStop && preStop.XSTATUS_0 !== 5 && preStop.XSTATUS_0 !== 6 && preStop.Sequence === '2') {
            this.utilService.showToast(languageRes['COMMON.COMPLETE_STOP_FIRST']);
            return false;
          } else {
            if (this.selectedStop.XSTATUS_0 == 5 || this.selectedStop.XSTATUS_0 == 6) {
              this.utilService.showToast(languageRes['COMMON.ALREADY_SKIPPED']);
            } else {
              const docNo = this.stopsDetails[0].XDOCNUM_0;
              this.router.navigate(['/tabs/stop-list/skip-stop'], { queryParams: { docNo } });
            }
          }
        } else {
          if (this.selectedStop.XSTATUS_0 == 5 || this.selectedStop.XSTATUS_0 == 6) {
            this.utilService.showToast(languageRes['COMMON.ALREADY_SKIPPED']);
          } else {
            const docNo = this.stopsDetails[0].XDOCNUM_0;
            this.router.navigate(['/tabs/stop-list/skip-stop'], { queryParams: { docNo } });
          }
        }
      }
    });
  }

  tel() {
    window.location.href = `tel:${this.stopsDetails[0].XMOB_0}`;
  }

  mail() {
    window.location.href = `mailto:${this.stopsDetails[0].XWEB_0}`;
  }

  goTo() {
    let routeId = localStorage.getItem('activeRouteId');
    this.router.navigate(['/tabs/stop-list'], { queryParams: { route: routeId } });
  }

  goToHome(){
    this.router.navigate(['tabs/routes']);
  }
}
