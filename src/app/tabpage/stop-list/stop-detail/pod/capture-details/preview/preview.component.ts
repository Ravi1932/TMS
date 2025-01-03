import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ISoapMethodResponse, NgxSoapService, security } from 'ngx-soap';
import { UtilService } from 'src/app/services/util.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { RoutesService } from 'src/app/services/routes.service';

const callcontent = `
      <codeLang xsi:type="xsd:string">${environment.soapLanguage}</codeLang>
      <poolAlias xsi:type="xsd:string">${environment.soapPoolAlias}</poolAlias>
      <poolId xsi:type="xsd:string">?</poolId>
      <requestConfig xsi:type="xsd:string">?</requestConfig>
`;

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {
  stopId;
  serviceResponse;
  productList = [];
  companyList: any = {};
  storedReport;
  utilService$ = this.utilService;
  Type;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private soap: NgxSoapService,
    private utilService: UtilService,
    private translateService: TranslateService,
    private routesService: RoutesService
  ) {
    this.route.queryParams
      .subscribe(async (params) => {
        this.serviceResponse = params.serviceResponse;
        this.Type = params.type;
        this.stopId = params.poddet;
        this.storedReport = await this.utilService.getStorageData('report');
        this.getReport();
      }
      );
  }

  ngOnInit() {

  }

  onClick() {
    if (this.Type == 'report') {
      const routeId = localStorage.getItem('activeRouteId');
      this.router.navigate(['/tabs/stop-list'], { queryParams: { route: routeId } });
    } else {
      this.router.navigate(['/tabs/stop-list/stop-detail/pod'], { queryParams: { poddet: this.stopId } });
    }
  }

  getReport() {
    if (this.utilService.isOnline) {
      this.utilService.showLoading();
      if (this.Type == 'report') {
        let value = `
      <![CDATA[<PARAM> 
      <FLD NAME="I_XSRENO" TYPE="Char">${this.stopId}</FLD> 
        <FLD NAME="I_XFLAG" TYPE="INT">3</FLD>
      </PARAM>]]>
      `;
        this.reportList(value);
      } else {
        let value = `
      <![CDATA[<PARAM> 
        <FLD NAME="I_XRESNO" TYPE="Char">${this.serviceResponse}</FLD> 
        <FLD NAME="I_XFLAG" TYPE="INT">2</FLD>
      </PARAM>]]>
      `;
        this.reportList(value);
      }
    } else {
      this.routesService.installBase(this.stopId).subscribe(async (res) => {
        res.map(x => {
          let obj = {};
          x.part.map(y => {
            obj = {
              O_XITMREF: y.Product,
              O_XITMDES: y.descrition,
              O_XQTY: y.Quantity ? y.Quantity : y.QTY_0,
              O_XUOM: y.Unit ? y.Unit : y.UOM_0
            }
            this.productList.push(obj);
          })
          x.service.map(y => {
            obj = {
              O_XITMREF: y.Product,
              O_XITMDES: y.descrition,
              O_XQTY: y.Duration,
              O_XUOM: y.Unit ? y.Unit : y.UOM_0
            }
            this.productList.push(obj);
          })
        })
        const reportData = await this.utilService.getStorageData('report')[this.stopId];
      })
      this.companyList = this.storedReport[this.stopId];
    }
  }

  reportList(value) {
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
      }).subscribe((resp: ISoapMethodResponse) => {
        this.utilService.dismissLoading();
        if (resp.result.runReturn.resultXml.$value) {
          const result = resp.result.runReturn.resultXml.$value.RESULT;
          result.GRP.map(x => {
            x.FLD.map(y => {
              let key = y.attributes.NAME;
              this.companyList[key] = y.$value;
            })
          })
          this.companyList.O_XDATE = moment(this.companyList.O_XDATE).format('MM-DD-YYYY')
          result.TAB.LIN.map(x => {
            let obj1 = {};
            x.FLD.map(y => {
              let key = y.attributes.NAME;
              obj1[key] = y.$value;
            })
            this.productList.push(obj1);
          })
        } else {
          const result = resp.result.runReturn?.messages[0].message;
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
  }

  sendEmail() {
    this.translateService.get(['COMMON.CONFIRMATION', 'COMMON.CONFIRM_DETAIL']).subscribe((languageRes: any) => {
      const message = `${this.companyList.O_XBPC !== undefined ? this.companyList.O_XBPC : ''} ${this.companyList.O_XBPCMAIL !== undefined ? this.companyList.O_XBPCMAIL : ''} <br> ${languageRes['COMMON.CONFIRM_DETAIL']}`;
      this.utilService.showConfirmationPopup(languageRes['COMMON.CONFIRMATION'], message, cb => {
        if (cb == 1) {
          this.utilService.showLoading();
          if (this.Type == 'report') {
            let value = `
          <![CDATA[<PARAM> 
            <FLD NAME="I_XSRENO" TYPE="Char">${this.stopId}</FLD> 
            <FLD NAME="I_XFLAG" TYPE="INT">4</FLD>
          </PARAM>]]>`;
            this.sendMail(value);
          } else {
            let value = `
          <![CDATA[<PARAM> 
              <FLD NAME="I_XRESNO" TYPE="Char">${this.serviceResponse}</FLD> 
              <FLD NAME="I_XFLAG" TYPE="INT">1</FLD>
          </PARAM>]]>`;
            this.sendMail(value);
          }
        }
      })
    });
  }

  sendMail(value) {
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
      }).subscribe((resp: ISoapMethodResponse) => {
        this.utilService.dismissLoading();
        if (resp.result.runReturn.resultXml?.$value) {
          const result = resp.result.runReturn.resultXml.$value.RESULT.GRP[1].FLD;
          if (result[4].$value == "2") {
            this.utilService.showToastSucccess("E-mail sent successfully");
            if (this.Type == 'report') {
              this.router.navigate(['/tabs/routes']);
            } else {
              this.router.navigate(['/tabs/stop-list/stop-detail/pod'], { queryParams: { poddet: this.stopId } });
            }
          } else {
            this.utilService.showToast("Something went wrong. Please try again later.");
          }
        } else {
          const result = resp.result.runReturn?.messages[0].message;
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
  }
  goToHome() {
    this.router.navigate(['tabs/routes']);
  }
}
