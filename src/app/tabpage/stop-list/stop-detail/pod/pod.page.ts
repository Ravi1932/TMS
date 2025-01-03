import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { RoutesService } from 'src/app/services/routes.service';
import { UtilService } from 'src/app/services/util.service';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-pod',
  templateUrl: './pod.page.html',
  styleUrls: ['./pod.page.scss'],
})

export class PodPage implements OnInit {
  stopId: string;
  pod: any = [];
  podModel = {
    confirm_arrival: '',
    delivery: '',
    departure: ''
  };
  deliverDateTime: any;
  currentStop: any;
  postParams;

  constructor(
    private routesService: RoutesService,
    private route: ActivatedRoute,
    private utilService: UtilService,
    private router: Router,
    private translateService: TranslateService
  ) {
    this.route.queryParams.subscribe(params => {
      if (params && params.poddet) {
        this.stopId = params.poddet;
        this.getPod();
      }
    })
  }

  ngOnInit() {
  }

  async getPod() {
    let routeId = localStorage.getItem('activeRouteId');
    await this.utilService.showLoading();
    forkJoin({
      pod: this.routesService.getPod(this.stopId),
      currentStop: this.routesService.getStops(routeId)
    }).subscribe(resp => {
      this.utilService.dismissLoading();
      localStorage.setItem('activeSite', resp.currentStop[0].XSTOFCY_0);
      localStorage.setItem('customerCode', resp.currentStop[0].XBPCORD_0);
      this.pod = resp.pod;
      this.currentStop = _.find(resp.currentStop, { XDOCNUM_0: this.stopId });
      localStorage.setItem('currentStop', JSON.stringify(this.currentStop));
      if (this.currentStop?.XARRTIM_0?.length > 1) {
        let arrDate: any = moment(this.currentStop.XARRVDAT_0).format('YYYY-MM-DD');
        let arrDateTime: any = new Date(arrDate + ' ' + this.currentStop.XARRTIM_0);
        this.podModel.confirm_arrival = arrDateTime;
      }

      if (this.currentStop?.XFINTIME_0?.length > 1) {
        //  let deliveredDate: any = moment(this.currentStop.XFINDAT_0).format('YYYY-MM-DD');
        //  let deliveredDateTime: any = new Date(deliveredDate + ' ' + this.currentStop.XFINTIME_0);
        this.podModel.delivery = 'Delivered';
        this.deliverDateTime = this.currentStop.XFINTIME_0;
        // this.deliverDateTime = deliveredDateTime;
      }

      // if (this.currentStop?.XDLV_STATUS_0 == 4) {
      // if (moment(this.currentStop.XFINDAT_0).format('YYYY-MM-DD') > '2023-01-01') {
      //   let deliveredDate: any = moment(this.currentStop.XFINDAT_0).format('YYYY-MM-DD');
      //   let deliveredDateTime: any = new Date(deliveredDate + ' ' + this.currentStop.XFINTIME_0);
      //   this.podModel.delivery = 'Delivered';
      //   this.deliverDateTime = deliveredDateTime;
      // }
      // this.deliverDateTime = this.currentStop.XFINTIME_0;
      // }

      // if (this.currentStop?.XENDULTIM_0.length > 1) {
      //   let endUnDate: any = moment(this.currentStop.XENDULDAT_0).format('YYYY-MM-DD');
      //   let endUnDateTime: any = new Date(endUnDate + ' ' + this.currentStop.XENDULTIM_0);
      //   this.podModel.end_unload = endUnDateTime;
      // }

      if (this.currentStop?.XDEPTIM_0.length > 1) {
        let departureDate: any = moment(this.currentStop.XDEPDAT_0).format('YYYY-MM-DD');
        let departureDateTime: any = new Date(departureDate + ' ' + this.currentStop.XDEPTIM_0);
        this.podModel.departure = departureDateTime;
        if (this.podModel.departure) {
          localStorage.setItem('departureTime', departureDateTime)
        }
      }
    }, (err: any) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    })
  }

  setDate(type) {
    const messages = [
      'COMMON.COMPLETE_ABOVE_STEP_FIRST',
    ];
    this.translateService.get(messages).subscribe(languageRes => {
      switch (type) {
        case 'confirm_arrival':
          this.updatePODStatus(type);
          break;
        case 'invoice':
          this.router.navigate(['/tabs/stop-list/stop-detail/pod/invoice']);
          break;
        case 'payment':
          this.router.navigate(['/tabs/stop-list/stop-detail/pod/payment']);
          break;
        case 'departure':
          if (this.podModel.delivery && this.podModel.confirm_arrival) {
            this.updatePODStatus(type);
          } else {
            this.utilService.showToast(languageRes['COMMON.COMPLETE_ABOVE_STEP_FIRST']);
          }
          break;
      }
    });
  }

  updatePODStatus(type) {
    this.translateService.get(['COMMON.CONFIRMATION', 'COMMON.ALREADY_COMPLETED', 'COMMON.ARE_YOU_SURE', + type.replace('_', ' ') + '?']).subscribe((languageRes: any) => {
      if (!this.podModel[type]) {
        this.utilService.showConfirmationPopup(languageRes['COMMON.CONFIRMATION'], languageRes['COMMON.ARE_YOU_SURE'] + type.replace('_', ' ') + '?', async cb => {
          if (cb == 1) {
            this.postParams = {
              doc: this.stopId,
              status_type: type,
              datetime: moment().format('YYYY-MM-DDTHH:mm:ss')
            }
            let routeId = localStorage.getItem('activeRouteId');
            if (type == 'confirm_arrival') {
              if (this.utilService.isOnline) {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      if (position.coords.latitude && position.coords.longitude) {
                        this.postParams.latitude = position.coords.latitude;
                        this.postParams.longitude = position.coords.longitude;
                      } else {
                        this.utilService.showToast();
                        return false;
                      }
                    }
                  );
                } else {
                  console.error("Geolocation is not supported by this browser.");
                }
              }
            }
            if (type == 'confirm_arrival' || type == 'departure') {
              this.postParams.route_no = routeId;
            }
            await this.utilService.showLoading();

            if (this.utilService.isOnline) {
              this.routesService.postStatus(this.postParams).subscribe((resp: any) => {
                this.utilService.dismissLoading();
                this.podModel[type] = new Date();
                if (type == 'departure') {
                  const params = {
                    route_no: routeId,
                    doc: this.stopId
                  }
                  this.routesService.updateDepartureTime(params).subscribe(res => {
                    this.router.navigate(['/tabs/stop-list']);
                  })
                }
              }, (err: any) => {
                this.utilService.dismissLoading();
                this.utilService.showErrorCall(err);
              });
            } else {
              this.utilService.storeApiIntoPending('/PODStatus', this.postParams, 'post', '', this.stopId);
              const stops = (await this.utilService.getStorageData('stops'));
              const currentStopIndex = stops[routeId].findIndex(d => d.XDOCNUM_0 == this.stopId);
              this.podModel[type] = new Date();
              if (type == 'confirm_arrival') {
                stops[routeId][currentStopIndex].XARRVDAT_0 = moment().format('YYYY-MM-DD');
                stops[routeId][currentStopIndex].XARRTIM_0 = moment().format('HH:mm');
                await this.utilService.setStorageData('stops', stops);
              } else if (type == 'departure') {
                const params = {
                  route_no: routeId,
                  doc: this.stopId
                }
                stops[routeId][currentStopIndex].XDEPDAT_0 = moment().format('YYYY-MM-DD');
                stops[routeId][currentStopIndex].XDEPTIM_0 = moment().format('HH:mm');
                stops[routeId][currentStopIndex].XISACTIVDOC_0 = 1;
                stops[routeId][currentStopIndex].XSTATUS_0 = 6;
                await this.utilService.setStorageData('stops', stops);
                this.utilService.storeApiIntoPending('/time_departure', params, 'post', '', this.stopId);
                this.router.navigate(['/tabs/stop-list']);
              }
              this.utilService.dismissLoading();
            }
          }
        });
      } else {
        this.utilService.showToast(languageRes['COMMON.ALREADY_COMPLETED']);
      }
    });
  }

  delivery() {
    this.translateService.get(['COMMON.PRODUCT_DELIVERED', 'COMMON.ALREADY_COMPLETED','COMMON.COMPLETE_ABOVE_STEP_FIRST']).subscribe((languageRes: any) => {
      if (!this.podModel.departure) {
        if (this.podModel.confirm_arrival) {
          // if (this.podModel.start_unload) {
          //   if (this.currentStop.XDLV_STATUS_0 == 4) {
          //     this.utilService.showToast(languageRes['COMMON.PRODUCT_DELIVERED']);
          //   }
          //   else {
          const podId = this.stopId
          this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details'], { queryParams: { podId } })
          //   }
        }
        else {
          this.utilService.showToast(languageRes['COMMON.COMPLETE_ABOVE_STEP_FIRST']);
        }
      } else {
        this.utilService.showToast(languageRes['COMMON.ALREADY_COMPLETED']);
      }
    });
  }
  
  goTo() {
    this.router.navigate(['/tabs/stop-list/stop-detail'], { queryParams: { stop: this.stopId } });
  }

  goToHome(){
    this.router.navigate(['tabs/routes']);
  }
}
