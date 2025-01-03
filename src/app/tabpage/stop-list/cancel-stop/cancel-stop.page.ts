import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutesService } from 'src/app/services/routes.service';
import { UtilService } from 'src/app/services/util.service';
import * as moment from 'moment';
import { ISoapMethodResponse, NgxSoapService, security } from 'ngx-soap';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';

const callcontent = `
      <codeLang xsi:type="xsd:string">${environment.soapLanguage}</codeLang>
      <poolAlias xsi:type="xsd:string">${environment.soapPoolAlias}</poolAlias>
      <poolId xsi:type="xsd:string">?</poolId>
      <requestConfig xsi:type="xsd:string">?</requestConfig>
`;

@Component({
  selector: 'app-cancel-stop',
  templateUrl: './cancel-stop.page.html',
  styleUrls: ['./cancel-stop.page.scss'],
})
export class CancelStopPage implements OnInit {
  submitted = false;
  cancelstopModel: any = {
    cancel_type: 'cancel',
    comment: '',
  };
  reschedstopModel: any = {
    cancel_type: 'reschedule',
    comment: '',
  };
  docNo;
  cancelReasons;
  reschedReasons;

  displayType = '';
  minDateTime = moment().add(1, 'day').format();
  maxDateTime = moment().add(10, 'year').format();
  cus_name;
  cus_code;
  custAvail;
  isCustVal: boolean = true;

  constructor(
    private utilService: UtilService,
    private router: Router,
    private route: ActivatedRoute,
    private routesService: RoutesService,
    private soap: NgxSoapService,
    private translateService: TranslateService
  ) {
    this.route.queryParams.subscribe(params => {
      if (params && params.docNo) {
        this.docNo = params.docNo;
        this.displayType = params.displayType;
        this.cus_name = params.cus_name;
        this.cus_code = params.cus_code;
      }
    });
  }

  async ngOnInit() {
    if (this.displayType == 'cancelStop') {
      this.getCancelReasons();
    }
    if (this.displayType == 'rescheduleStop') {
      this.rescheduleReasons();
      this.customerAvailable();
    }
  }

  async getCancelReasons() {
    await this.utilService.showLoading();
    this.routesService.cancelReasons().subscribe((resp) => {
      if (!this.utilService.isOnline) {
        this.cancelReasons = resp;
      } else {
        this.cancelReasons = resp;
        this.utilService.setStorageData('cancelReasons', this.cancelReasons);
        this.utilService.dismissLoading();
      }
    }, (err) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    });
  }

  async rescheduleReasons() {
    await this.utilService.showLoading();
    this.routesService.rescheduleReasons().subscribe((resp) => {
      if (!this.utilService.isOnline) {
        this.reschedReasons = resp;
      } else {
        this.reschedReasons = resp;
        this.utilService.dismissLoading();
      }
    }, (err) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    });
  }

  checkCusVal() {
    const dateDay = moment(this.reschedstopModel.reschedule_date).day();
    // let objectKey = Object.keys(this.custAvail);
    let objectVal = Object.values(this.custAvail);
    if (dateDay == 0) {
      if (objectVal[6] == 2) {
        this.isCustVal = true;
      } else if (objectVal[6] == 1) {
        this.isCustVal = false;
      }
    } else {
      if (objectVal[dateDay - 1] == 2) {
        this.isCustVal = true;
      } else if (objectVal[dateDay - 1] == 1) {
        this.isCustVal = false;
      }
    }
  }

  customerAvailable() {
    const params = { CustCode: this.cus_code }
    this.routesService.customerAvailable(params).subscribe((resp) => {
      if (!this.utilService.isOnline) {
        this.custAvail = resp;
      } else {
        this.custAvail = resp[0];
      }
    }, (err) => {
      this.utilService.showErrorCall(err);
    });
  }

  onSubmit(form) {
    this.submitted = true;
    if (form.valid) {
      if (this.displayType == 'cancelStop') {
        this.translateService.get(['COMMON.CONFIRMATION', 'COMMON.STOP_CANCEL_CONFIRMATION']).subscribe((languageRes: any) => {
          this.utilService.showConfirmationPopup(languageRes['COMMON.CONFIRMATION'], languageRes['COMMON.STOP_CANCEL_CONFIRMATION'], async cb => {
            if (cb == 1) {
              this.cancelstopModel.doc = this.docNo;
              const datetime = moment().format('YYYY-MM-DDTHH:mm:ss');
              let routeId = localStorage.getItem('activeRouteId');
              this.cancelstopModel.datetime = datetime;
              this.cancelstopModel.route_no = routeId;
              await this.utilService.showLoading();
              this.routesService.postCancelRoute(this.cancelstopModel).subscribe((resp: any) => {
                this.utilService.dismissLoading();
                this.router.navigate(['/tabs/stop-list'], { queryParams: { route: routeId } });
              }, (err: any) => {
                this.utilService.dismissLoading();
                this.utilService.showErrorCall(err);
              });
            }
          });
        });
      }
      if (this.displayType == 'rescheduleStop') {
        if (this.isCustVal) {
          this.translateService.get(['COMMON.CONFIRMATION', 'COMMON.RESCHEDULE_CONFIRMATION']).subscribe((languageRes: any) => {
            this.utilService.showConfirmationPopup(languageRes['COMMON.CONFIRMATION'], languageRes['COMMON.RESCHEDULE_CONFIRMATION'], async cb => {
              if (cb == 1) {
                const params = {
                  doc: this.docNo,
                  datetime: moment(this.reschedstopModel.reschedule_date).format('YYYY-MM-DDTHH:mm:ss')
                }
                this.routesService.docReschedule(params).subscribe((resp) => {
                }, (err) => {
                  this.utilService.showErrorCall(err);
                });

                const soapDate = moment(this.reschedstopModel.reschedule_date).format('YYYYMMDD');
                let value = `
            <![CDATA[<PARAM>
              <GRP ID="SDH1_1">
                <FLD NAME="DLVDAT" TYPE="Date">${soapDate}</FLD>
              </GRP>
            </PARAM>]]>`;

                await this.utilService.showLoading();
                this.soap.createClient(environment.soap + '/soap-wsdl/syracuse/collaboration/syracuse/CAdxWebServiceXmlCC?wsdl', {
                  attributesKey: 'attributes', valueKey: '$value', xmlKey: '$xml'
                }).then(client => {
                  client.setSecurity(new security.BasicAuthSecurity(environment.soapUsername, environment.soapPassword, ''))
                  client.call('modify', {
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
                      $value: 'XX10ASDH'
                    },
                    objectKeys: {
                      attributes: {
                        "xsi:type": "wss:ArrayOfCAdxParamKeyValue",
                        "soapenc:arrayType": "wss:CAdxParamKeyValue[]",
                      },
                      key: {
                        $value: 'SDHNUM'
                      },
                      value: {
                        $value: `${this.docNo}`
                      },
                    },
                    objectXml: {
                      attributes: {
                        "xsi:type": "xsd:string"
                      },
                      $xml: value
                    }
                  }).subscribe((res: ISoapMethodResponse) => {
                    this.utilService.dismissLoading();
                    let routeId = localStorage.getItem('activeRouteId');
                    this.router.navigate(['/tabs/stop-list'], { queryParams: { route: routeId } });
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
              }
            });
          });
        }
      }
    }
  }
}
