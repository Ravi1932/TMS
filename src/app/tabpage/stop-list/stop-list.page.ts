import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutesService } from 'src/app/services/routes.service';
import { UtilService } from 'src/app/services/util.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { IonContent, IonRefresher, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { ISoapMethodResponse, NgxSoapService, security } from 'ngx-soap';
import { ActionPopoverComponent } from './action-popover/action-popover.component';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
const callcontent = `
      <codeLang xsi:type="xsd:string">${environment.soapLanguage}</codeLang>
      <poolAlias xsi:type="xsd:string">${environment.soapPoolAlias}</poolAlias>
      <poolId xsi:type="xsd:string">?</poolId>
      <requestConfig xsi:type="xsd:string">?</requestConfig>
`;
@Component({
  selector: 'app-stop-list',
  templateUrl: './stop-list.page.html',
  styleUrls: ['./stop-list.page.scss'],
})

export class StopListPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content: IonContent;
  @ViewChild(IonRefresher) pullToRefresh: IonRefresher;
  isStarted: boolean;
  stops: any;
  routeId: string;
  currentStop;
  skillGroupList
  isFuture: boolean = false;
  isPrevious: boolean = false;
  isCheckedIn: boolean = false;
  isCheckedOut: boolean = false;
  isStopActive: boolean = false;
  isPreviousChecked: boolean = false;
  isAllDeparture: boolean = false;
  isAnyRouteIsActive: boolean = false;
  search: '';
  siteList;
  customerList;
  searchedStops: any;
  stopType: any = 'To-Do';
  todoStops: any;
  searchedToDo: any;
  activeStops: any;
  addressList;
  searchedActive: any;
  deliverdStops: any;
  installBaseList: any = [];
  searchedDeliverd: any;
  isDisabled = true;
  checkedModel: any = {
    checkedIn: '',
    checkedOut: ''
  }
  container: any;
  routeData: any;
  driverId;
  pendingAPIInterval;
  constructor(
    private router: Router,
    private utilService: UtilService,
    private routesService: RoutesService,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private popoverController: PopoverController,
    private soap: NgxSoapService,
    public storage: Storage
  ) {
    this.driverId = localStorage.getItem('podDriverId');
    this.route.queryParams.subscribe(params => {
      if (params && params.route) {
        this.routeId = params.route;
        this.stopType = 'To-Do';
        this.getStops();
        this.getRoute();
      } else {
        if (localStorage.getItem('activeRouteId')) {
          this.routeId = localStorage.getItem('activeRouteId');
          this.stopType = 'To-Do';
          this.getStops();
          this.getRoute();
        }
      }
    });
  }
  // ionViewWillEnter() {
  //   this.getStops();
  // }


  scroll() {
    this.content?.scrollToTop(0);
  }

  async getStops() {
    await this.utilService.showLoading();
    this.routesService.getStops(this.routeId).subscribe((res: any) => {
      this.completeWidgets();
      this.stops = res;
      this.stops.map(x => {
        this.getReportList(x.XDOCNUM_0);
      })
      if (this.stops[0]?.XCKINTIM_0.length > 1) {
        this.isCheckedIn = true;
        let checkInDate: any = moment(this.stops[0]?.XCKINDAT_0).format('YYYY-MM-DD');
        let checkInDateTime: any = new Date(checkInDate + ' ' + this.stops[0]?.XCKINTIM_0);
        this.checkedModel.checkedIn = checkInDateTime;
      } else {
        this.isCheckedIn = false;
      }
      const isAllDelivered = _.filter(this.stops, (isAllCom) => {
        return isAllCom.XSTATUS_0 == 6 && isAllCom.XCKOTTIM_0.length > 1
      });
      if (this.stops.length == isAllDelivered.length) {
        this.isCheckedOut = true;
        let checkOutDate: any = moment(this.stops[0]?.XCKOTDAT_0).format('YYYY-MM-DD');
        let checkOutDateTime: any = (checkOutDate + ' ' + this.stops[0]?.XCKOTTIM_0);
        this.checkedModel.checkedOut = checkOutDateTime;
      } else {
        this.isCheckedOut = false;
      }
      const isAnyStopActive = _.filter(this.stops, { XISACTIVDOC_0: 2 });
      if (isAnyStopActive.length > 0) {
        this.isStopActive = true;
      } else {
        this.isStopActive = false;
      }
      const isAllStopDeparture = _.filter(this.stops, { XDEPTIM_0: " " });
      if (isAllStopDeparture.length > 0) {
        this.isAllDeparture = false;
      } else {
        this.isAllDeparture = true;
      }
      this.searchedStops = _.cloneDeep(this.stops);
      // this.stopType = 'To-Do';
      this.filterStopsByStatus();
    }, (err: any) => {
      this.completeWidgets();
      this.utilService.showErrorCall(err);
    });
  }

  getRoute() {
    this.utilService.getStorageData('routes').then((routes) => {
      this.routeData = _.find(routes, { XDRN_0: this.routeId });
    });
  }

  checkValidation(callback) {
    this.utilService.getStorageData('routes').then((routes) => {
      const route = _.find(routes, { XDRN_0: this.routeId });
      this.isFuture = route.XDLVDAT_0 > new Date();
      const isAnyStopActive = _.filter(this.stops, { XISACTIVDOC_0: 2 });
      if (isAnyStopActive.length > 0) {
        this.isStopActive = true;
      } else {
        this.isStopActive = false;
      }
      if (route.XTRIP_0 == 1) {
        this.isPrevious = true;
      } else {
        let previousTrip = _.find(routes, { XTRIP_0: route.XTRIP_0 - 1, XDLVDAT_0: route.XDLVDAT_0 });
        this.isPrevious = (previousTrip) ? true : false;
        // let previousRoutes = _.find(routes, { XTRIP_0: route.XTRIP_0 - 1 });
        // this.isPreviousChecked = (previousRoutes && previousRoutes?.XROUTSTAT_0 == 2) ? true : false;
      }
      let anyRouteIsActive = _.find(routes, (routeList) => {
        return (routeList?.XROUTSTAT_0 == 2 || routeList?.XROUTSTAT_0 == 4);
      });
      if (anyRouteIsActive) {
        this.isAnyRouteIsActive = (anyRouteIsActive?.XROUTSTAT_0 == 2 || anyRouteIsActive?.XROUTSTAT_0 == 4) ? true : false;
      } else {
        this.isAnyRouteIsActive = false;
      }
      callback();
    });
  }

  stopDetails(docNo, docIndex) {
    const messages = [
      'COMMON.COMPLETE_STOP_FIRST',
      'COMMON.COMPLETE_PREV_TRIP_FIRST',
      'COMMON.FUTURE_ROUTE_ALERT',
      'COMMON.CHECKIN_FIRST',
    ];

    this.translateService.get(messages).subscribe(languageRes => {
      if (this.isCheckedIn) {
        this.checkValidation(() => {
          if (!this.isFuture) {
            if (this.isPrevious) {
              let preStopCom = _.find(this.stops, { XCSGNUM_0: docIndex - 1 });
              if (this.stops[0].Sequence === '2') {
                if (preStopCom && (preStopCom?.XSTATUS_0 !== 4 || preStopCom?.XDEPTIM_0 == ' ')) {
                  // this.utilService.showToast(languageRes['COMMON.COMPLETE_STOP_FIRST']);
                  // return false;
                  if (preStopCom && (preStopCom?.XSTATUS_0 === 6)) {
                    this.router.navigate(['/tabs/stop-list/stop-detail'], { queryParams: { stop: docNo } });
                  } else {
                    this.utilService.showToast(languageRes['COMMON.COMPLETE_STOP_FIRST']);
                    return false;
                  }
                } else {
                  this.router.navigate(['/tabs/stop-list/stop-detail'], { queryParams: { stop: docNo } });
                }
              } else if (this.stops[0].Sequence === '1') {
                this.router.navigate(['/tabs/stop-list/stop-detail'], { queryParams: { stop: docNo } });
              }
            } else {
              this.utilService.showToast(languageRes['COMMON.COMPLETE_PREV_TRIP_FIRST']);
            }
          } else {
            this.utilService.showToast(languageRes['COMMON.FUTURE_ROUTE_ALERT']);
          }
        });
      } else {
        this.utilService.showToast(languageRes['COMMON.CHECKIN_FIRST']);
      }
    });
  }

  skipStop(event: any, docNo, docIndex) {
    event.preventDefault();
    event.stopPropagation();
    const messages = [
      'COMMON.COMPLETE_ACTIVE_STOP_FIRST',
      'COMMON.COMPLETE_STOP_FIRST',
      'COMMON.COMPLETE_PREV_TRIP_FIRST',
      'COMMON.FUTURE_ROUTE_ALERT',
      'COMMON.CHECKIN_FIRST',
      'COMMON.ALREADY_SKIPPED'
    ];
    this.translateService.get(messages).subscribe(languageRes => {
      if (this.isCheckedIn) {
        this.checkValidation(() => {
          if (!this.isFuture) {
            if (this.isStopActive) {
              this.utilService.showToast(languageRes['COMMON.COMPLETE_ACTIVE_STOP_FIRST']);
            } else {
              if (this.isPrevious) {
                let preStopCom = _.find(this.stops, { XCSGNUM_0: docIndex - 1 });
                if (this.stops[0].Sequence === '2') {
                  if (preStopCom && (preStopCom?.XSTATUS_0 !== 4 || preStopCom?.XDEPTIM_0 == ' ')) {
                    this.utilService.showToast(languageRes['COMMON.COMPLETE_STOP_FIRST']);
                    return false;
                  } else {
                    this.currentStop = _.find(this.stops, { XDOCNUM_0: docNo });
                    if (this.currentStop.XSTATUS_0 == 1 || this.currentStop.XSTATUS_0 == 5 || this.currentStop.XSTATUS_0 == 4) {
                      this.utilService.showToast(languageRes['COMMON.ALREADY_SKIPPED']);
                    } else {
                      this.router.navigate(['/tabs/stop-list/skip-stop'], { queryParams: { docNo } });
                    }
                  }
                } else if (this.stops[0].Sequence === '1') {
                  this.currentStop = _.find(this.stops, { XDOCNUM_0: docNo });
                  if (this.currentStop.XSTATUS_0 == 1 || this.currentStop.XSTATUS_0 == 5 || this.currentStop.XSTATUS_0 == 4) {
                    this.utilService.showToast(languageRes['COMMON.ALREADY_SKIPPED']);
                  } else {
                    this.router.navigate(['/tabs/stop-list/skip-stop'], { queryParams: { docNo } });
                  }
                }
                // this.currentStop = _.find(this.stops, { XDOCNUM_0: docNo });
                // if (this.currentStop.XSTATUS_0 == 1 || this.currentStop.XSTATUS_0 == 5 || this.currentStop.XSTATUS_0 == 6) {
                //   this.utilService.showToast('Already skipped!');
                // } else {
                //   this.router.navigate(['/tabs/stop-list/skip-stop'], { queryParams: { docNo } });
                // }
              } else {
                this.utilService.showToast(languageRes['COMMON.COMPLETE_PREV_TRIP_FIRST']);
              }
            }
          } else {
            this.utilService.showToast(languageRes['COMMON.FUTURE_ROUTE_ALERT']);
          }
        });
      } else {
        this.utilService.showToast(languageRes['COMMON.CHECKIN_FIRST']);
      }
    });
  }

  cancelStop(event: any, docNo, docIndex) {
    event.preventDefault();
    event.stopPropagation();
    const messages = [
      'COMMON.COMPLETE_ACTIVE_STOP_FIRST',
      'COMMON.COMPLETE_STOP_FIRST',
      'COMMON.COMPLETE_PREV_TRIP_FIRST',
      'COMMON.FUTURE_ROUTE_ALERT',
      'COMMON.CHECKIN_FIRST',
      'COMMON.ALREADY_CANCELLED',
    ];
    this.translateService.get(messages).subscribe(languageRes => {
      if (this.isCheckedIn) {
        this.checkValidation(() => {
          if (!this.isFuture) {
            if (this.isPrevious) {
              let preStopCom = _.find(this.stops, { XCSGNUM_0: docIndex - 1 });
              if (this.stops[0].Sequence === '2') {
                if (preStopCom && (preStopCom?.XSTATUS_0 !== 4 || preStopCom?.XDEPTIM_0 == ' ')) {
                  this.utilService.showToast(languageRes['COMMON.COMPLETE_STOP_FIRST']);
                  return false;
                } else {
                  this.currentStop = _.find(this.stops, { XDOCNUM_0: docNo });
                  if (this.currentStop.XSTATUS_0 == 1 || this.currentStop.XSTATUS_0 == 5 || this.currentStop.XSTATUS_0 == 4) {
                    this.utilService.showToast(languageRes['COMMON.ALREADY_CANCELLED']);
                  } else {
                    this.router.navigate(['/tabs/stop-list/cancel-stop'], { queryParams: { docNo, displayType: "cancelStop" }, });
                  }
                }
              } else if (this.stops[0].Sequence === '1') {
                this.currentStop = _.find(this.stops, { XDOCNUM_0: docNo });
                if (this.currentStop.XSTATUS_0 == 1 || this.currentStop.XSTATUS_0 == 5 || this.currentStop.XSTATUS_0 == 4) {
                  this.utilService.showToast(languageRes['COMMON.ALREADY_CANCELLED']);
                } else {
                  this.router.navigate(['/tabs/stop-list/cancel-stop'], { queryParams: { docNo, displayType: "cancelStop" } });
                }
              }
            } else {
              this.utilService.showToast(languageRes['COMMON.COMPLETE_PREV_TRIP_FIRST']);
            }
          } else {
            this.utilService.showToast(languageRes['COMMON.FUTURE_ROUTE_ALERT']);
          }
        });
      } else {
        this.utilService.showToast(languageRes['COMMON.CHECKIN_FIRST']);
      }
    });
  }

  searchStops() {
    if (this.search) {
      let filter;
      if (this.stopType == 'To-Do') {
        filter = _.cloneDeep(this.searchedToDo);
      } else if (this.stopType == 'Active') {
        filter = _.cloneDeep(this.searchedActive);
      } else if (this.stopType == 'Delivered') {
        filter = _.cloneDeep(this.searchedDeliverd);
      }
      const searchedData = _.filter(filter, (data) => {
        return data.XDOCNUM_0.toLowerCase().indexOf(this.search.toLowerCase()) > -1 ||
          data.XBPNAME_0.toLowerCase().indexOf(this.search.toLowerCase()) > -1 ||
          data.XBPCORD_0.toLowerCase().indexOf(this.search.toLowerCase()) > -1 ||
          data.XCTY_0.toLowerCase().indexOf(this.search.toLowerCase()) > -1;
      });
      this.todoStops = searchedData;
      this.activeStops = searchedData;
      this.deliverdStops = searchedData;
    } else {
      if (this.stopType == 'To-Do') {
        this.todoStops = _.cloneDeep(this.searchedToDo);
      } else if (this.stopType == 'Active') {
        this.activeStops = _.cloneDeep(this.searchedActive);
      } else if (this.stopType == 'Delivered') {
        this.deliverdStops = _.cloneDeep(this.searchedDeliverd);
      }
    }
  }

  filterStopsByStatus() {
    this.search = '';
    const cloneRoutes = _.cloneDeep(this.stops);
    if (this.stopType == 'To-Do') {
      // this.todoStops = _.filter(cloneRoutes, (stop => {
      //   return (stop.XSTATUS_0 !== 4) && stop.XISACTIVDOC_0 != 2
      // }));
      this.todoStops = _.filter(cloneRoutes, (stop => {
        return (stop.XSTATUS_0 == 2 || stop.XSTATUS_0 == 8)
      }));
      this.searchedToDo = _.cloneDeep(this.todoStops);

    } else if (this.stopType == 'Active') {
      // this.activeStops = _.filter(cloneRoutes, (stop => {
      //   return (stop.XISACTIVDOC_0 == 2 || stop.XSTATUS_0 == 4) && (stop.XDEPTIM_0 == '' || stop.XDEPTIM_0 == ' ');
      // }));
      this.activeStops = _.filter(cloneRoutes, (stop => {
        return (stop.XSTATUS_0 == 3 || stop.XSTATUS_0 == 4 || stop.XSTATUS_0 == 6) && (stop.XDEPTIM_0 == " " || stop.XDEPTIM_0 == "");
      }));
      this.searchedToDo = _.cloneDeep(this.todoStops);
      // this.activeStops.map(x => {
      //   this.getReportList(x.XDOCNUM_0);
      // })
    } else if (this.stopType == 'Delivered') {
      // this.deliverdStops = _.filter(cloneRoutes, (stop => {
      //   return stop.XSTATUS_0 == 4 && stop.XDEPTIM_0.length > 1;
      // }));
      this.deliverdStops = _.filter(cloneRoutes, (stop => {
        return stop.XSTATUS_0 == 6 &&
          (stop.XDEPTIM_0 !== " " || stop.XDEPTIM_0 !== "");
      }));
      // this.deliverdStops.map(x => {
      //   this.getReportList(x.XDOCNUM_0);
      // })
      const dateTimeData = this.deliverdStops.map((item, index) => {
        let checkOutDate: any = moment(item?.XCKOTDAT_0).format('YYYY-MM-DD');
        let checkOutDateTime: any = checkOutDate + ' ' + item?.XCKOTTIM_0;
        this.checkedModel.checkedOut = checkOutDateTime;
        let deliveredDate: any = moment(item.XFINDAT_0).format('YYYY-MM-DD');
        let deliveredDateTime: any = new Date(deliveredDate + ' ' + item.XFINTIME_0);
        const data = Object.assign({}, item);
        data.DLDATTIM = String(deliveredDateTime);
        return data;
      })
      this.deliverdStops = dateTimeData;
      this.searchedDeliverd = _.cloneDeep(this.deliverdStops);
    }
    this.scroll();
  }

  checkIn() {
    const messages = [
      'COMMON.ALREADY_CHECKIN',
      'COMMON.CHECKIN',
      'COMMON.CHECKIN_CONFIRMATION',
      'COMMON.CHECKIN_AT',
      'COMMON.PLEASE_COMPLETE_PREV_TRIP',
      'COMMON.COMPLETE_IN_PROGRESS_OR_CHECK_IN_ROUTE'
    ];
    this.translateService.get(messages).subscribe(languageRes => {
      this.checkValidation(() => {
        if (!this.isAnyRouteIsActive) {
          if (this.isPrevious) {
            if (this.stops[0].XCKINTIM_0?.length > 1) {
              this.utilService.showToast(languageRes['COMMON.ALREADY_CHECKIN'])
            } else {
              const params = {
                doc: this.routeId,
                datetime: moment().format('YYYY-MM-DDTHH:mm:ss')
              };
              this.utilService.showConfirmationPopup(languageRes['COMMON.CHECKIN'], languageRes['COMMON.CHECKIN_CONFIRMATION'], cb => {
                if (cb == 1) {
                  if (!this.utilService.isOnline) {
                    this.utilService.showToastError('please check your internet connection');
                    // this.utilService.storeApiIntoPending('/CheckIn', params, 'post');
                    // this.isCheckedIn = true;
                    // this.checkedModel.checkedIn = new Date();
                    // const routeId = localStorage.getItem('activeRouteId');
                    // this.stops[0].isCheckedIn = true;
                    // this.stops[0].XCKINDAT_0 = moment(new Date()).format('YYYY-MM-DD');
                    // this.stops[0].XCKINTIM_0 = moment(new Date()).format('HH:mm:ss');
                    // this.utilService.setStorageData(routeId, this.stops)
                    // this.utilService.showToastSucccess(languageRes['COMMON.CHECKIN_AT'] + this.stops[0].XFCYDES_0 + '(' + this.stops[0].XSTOFCY_0 + ')');
                  } else {
                    this.routesService.postCheckIn(params).subscribe((res) => {
                      this.isCheckedIn = true;
                      this.checkedModel.checkedIn = new Date();
                      this.getStops();
                      this.utilService.showToastSucccess(languageRes['COMMON.CHECKIN_AT'] + this.stops[0].XFCYDES_0 + '(' + this.stops[0].XSTOFCY_0 + ')');

                    }, (err) => {
                      this.isCheckedIn = false;
                      this.utilService.showErrorCall(err);
                    });
                  }
                }
              });
            }
          } else {
            this.utilService.showToast(languageRes['COMMON.PLEASE_COMPLETE_PREV_TRIP']);
          }
        } else {
          this.utilService.showToast(languageRes['COMMON.COMPLETE_IN_PROGRESS_OR_CHECK_IN_ROUTE']);
        }
      });
    });
  }

  getReportList(XDOCNUM_0) {
    if (this.utilService.isOnline) {
      let value = `
    <![CDATA[<PARAM>
      <FLD NAME="I_XSRENO" TYPE="Char">${XDOCNUM_0}</FLD> 
      <FLD NAME="I_XFLAG" TYPE="INT">3</FLD>
    </PARAM>]]>\n`;
      this.soap.createClient(environment.soap + '/soap-wsdl/syracuse/collaboration/syracuse/CAdxWebServiceXmlCC?wsdl', {
        attributesKey: 'attributes', valueKey: '$value', xmlKey: '$xml'
      }).then(client => {
        client.setSecurity(new security.BasicAuthSecurity(environment.soapUsername, environment.soapPassword, ''))
        client.call('run', {
          callContext: {
            $xml: callcontent,
            attributes: {
              'xsi:type': "wss:CAdxCallContext"
            },
          },
          publicName: {
            attributes: {
              'xsi:type': "xsd:string"
            },
            $value: 'X10CXPOCRP'
          },
          inputXml: {
            attributes: {
              'xsi:type': "xsd:string"
            },
            $xml: value
          }
        }).subscribe(async (res: ISoapMethodResponse) => {
          this.utilService.dismissLoading();
          if (res.result.runReturn.resultXml?.$value) {
            const result = res.result.runReturn.resultXml.$value.RESULT.GRP;
            let obj = {};
            result.map(x => {
              x.FLD.map(y => {
                let key = y.attributes.NAME;
                obj[key] = y.$value;
              })

            })
            const data = await this.utilService.getStorageData('report') ?? {};
            data[XDOCNUM_0] = obj;
            await this.utilService.setStorageData('report', data);
          } else {
            const result = res.result.runReturn?.messages[0].message;
            this.utilService.showToast(result)
          }
        }, err => {
          console.log(err);
          this.utilService.showToast();
          this.utilService.dismissLoading();
        });
      })
    }
  }

  goToReport(stopId) {
    this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details/preview'], { queryParams: { poddet: stopId, type: 'report' } });
  }

  async checkOut() {
    const messages = [
      'COMMON.ALREADY_CHECKOUT',
      'COMMON.CHECKOUT',
      'COMMON.CHECKOUT_CONFIRMATION',
      'COMMON.STOP_CHECKOUT',
      'COMMON.COMPLETE_ALL_ROUTE',
    ];
    this.translateService.get(messages).subscribe(languageRes => {
      const isAllDelivered = _.filter(this.stops, { XSTATUS_0: 6 });
      if (this.stops.length == isAllDelivered.length) {
        if (this.stops[0].XCKOTTIM_0?.length > 1) {
          this.utilService.showToast(languageRes['COMMON.ALREADY_CHECKOUT'])
        } else {
          const params = {
            doc: this.routeId,
            datetime: moment().format('YYYY-MM-DDTHH:mm:ss')
          };
          this.utilService.showConfirmationPopup(languageRes['COMMON.CHECKOUT'], languageRes['COMMON.CHECKOUT_CONFIRMATION'], cb => {
            if (cb == 1) {
              if (!this.utilService.isOnline) {
                this.utilService.showToastError('please check your internet connection');
                //   this.utilService.storeApiIntoPending('/CheckOut', params, 'post', '');
                //   this.isCheckedOut = true;
                //   this.checkedModel.checkedOut = new Date();
                //   this.stops[0].XCKOTDAT_0 = moment(new Date()).format('YYYY-MM-DD');
                //   this.stops[0].XCKOTTIM_0 = moment(new Date()).format('HH:mm');
                //   this.utilService.setStorageData(this.routeId, this.stops);
                //   this.utilService.showToastSucccess(languageRes['COMMON.STOP_CHECKOUT']);
              } else {
                let pendingApiList = this.storage.get('pendingApiList');
                let pendingApiListLineNumber = this.storage.get('pendingApiListLineNumber');
                if (!pendingApiList && !pendingApiListLineNumber) {
                  this.utilService.showLoading();
                  this.logoutAPICallingAndCheckOut(params);
                } else {
                  this.utilService.showLoading();
                  this.pendingAPIInterval = setInterval(async () => {
                    let pendingApiList = await this.storage.get('pendingApiList');
                    let pendingApiListLineNumber = await this.storage.get('pendingApiListLineNumber');
                    if (!pendingApiList && !pendingApiListLineNumber) {
                      setTimeout(() => {
                        this.logoutAPICallingAndCheckOut(params);
                      }, 2000);
                      clearInterval(this.pendingAPIInterval);
                    }
                  }, 1000);
                }
              }
            }
          });
        }
      } else {
        this.utilService.showToast(languageRes['COMMON.COMPLETE_ALL_ROUTE'])
      }
    });
  }

  logoutAPICallingAndCheckOut(params) {
    this.routesService.postCheckOut(params).subscribe((res) => {
      this.utilService.dismissLoading();
      this.isCheckedOut = true;
      this.checkedModel.checkedOut = new Date();
      this.utilService.showToastSucccess('Stop checked-out successfully');
      this.router.navigate(['/tabs/routes']);
    }, (err) => {
      this.utilService.showErrorCall(err);
    });
  }

  ionViewDidLeave() {
    this.search = '';
  }

  doRefresh(event) {
    this.getStops();
  }

  completeWidgets() {
    this.utilService.dismissLoading();
    if (this.pullToRefresh) {
      this.pullToRefresh.complete()
    }
  }

  onReschedule(stopId) {
    this.router.navigate(['/tabs/stop-list/reschedule-stop'], { queryParams: { id: this.routeId, serviceRequest: stopId } })
  }

  async presentPopover(ev, array) {
    //  if (this.utilService.isOnline) {
    localStorage.setItem('serviceRequest', JSON.stringify(array));
    //  }
    const popover = await this.popoverController.create({
      component: ActionPopoverComponent,
      event: ev,
      translucent: false,
      cssClass: 'custom-popover'
    });
    await popover.present();
  }

  ngOnInit() {
    this.stopType = 'To-Do';
    this.watchPosition();
  }

  watchPosition(): Observable<{ lat: number, lng: number }> {
    return new Observable(observer => {
      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          (position) => {
            observer.next({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            observer.error(error);
          },
          {
            enableHighAccuracy: true, // You can adjust these options
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        observer.error('Geolocation is not supported by this browser.');
      }
    });
  }

  deleteService(stopId) {
    let value = `
          <![CDATA[<PARAM>
              <FLD NAME='I_XSRENUM'>${stopId}</FLD>
          </PARAM>]]>\n`;
    if (this.utilService.isOnline) {
      this.utilService.showLoading();
      this.soap.createClient(environment.soap + '/soap-wsdl/syracuse/collaboration/syracuse/CAdxWebServiceXmlCC?wsdl', {
        attributesKey: 'attributes', valueKey: '$value', xmlKey: '$xml'
      }).then(client => {
        client.setSecurity(new security.BasicAuthSecurity(environment.soapUsername, environment.soapPassword, ''))
        client.call('run', {
          callContext: {
            $xml: callcontent,
            attributes: {
              'xsi:type': "wss:CAdxCallContext"
            },
          },
          publicName: {
            attributes: {
              'xsi:type': "xsd:string"
            },
            $value: 'X1CSREDEL'
          },
          inputXml: {
            attributes: {
              'xsi:type': "xsd:string"
            },
            $xml: value
          }
        }).subscribe((res: ISoapMethodResponse) => {
          this.utilService.dismissLoading();
          if (res.result.runReturn.resultXml?.$value) {
            const result = res.result.runReturn.resultXml.$value.RESULT.GRP[1].FLD;
            if (result[1].$value == "2") {
              this.utilService.showToastSucccess(result[0].$value);
              this.popoverController.dismiss();
              this.getStops();
            } else {
              this.utilService.showToast(result[0].$value);
            }
          } else {
            const result = res.result.runReturn?.messages[0].message;
            this.utilService.showToast(result)
          }
        }, err => {
          console.log(err);
          this.utilService.showToast();
          this.utilService.dismissLoading();
        });
      }).catch(err => {
        console.log(err);
        this.utilService.showToast();
        this.utilService.dismissLoading();
      });
    } else {
      this.utilService.storeApiIntoPending('X1CSREDEL', value, 'soap', '', stopId);
      localStorage.removeItem('serviceRequest');
      this.todoStops.map((x, index) => {
        if (stopId == x.XDOCNUM_0) {
          this.todoStops.splice(index, 1);
        }
      })
      this.popoverController.dismiss();
      this.utilService.showToastSucccess('Deletion Success');
    }
  }

  goTo() {
    this.router.navigate(['tabs/routes']);
  }
}
