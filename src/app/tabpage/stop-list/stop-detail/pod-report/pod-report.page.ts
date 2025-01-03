import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ISoapMethodResponse, NgxSoapService, security } from 'ngx-soap';
import { RoutesService } from 'src/app/services/routes.service';
import { UtilService } from 'src/app/services/util.service';
import { environment } from 'src/environments/environment';

const callcontent = `
      <codeLang xsi:type="xsd:string">${environment.soapLanguage}</codeLang>
      <poolAlias xsi:type="xsd:string">${environment.soapPoolAlias}</poolAlias>
      <poolId xsi:type="xsd:string">?</poolId>
      <requestConfig xsi:type="xsd:string">?</requestConfig>
`;

@Component({
  selector: 'app-pod-report',
  templateUrl: './pod-report.page.html',
  styleUrls: ['./pod-report.page.scss'],
})
export class PodReportPage implements OnInit {
  podReportId;
  podReportDetails = [];
  constructor(
    private routesService: RoutesService,
    private route: ActivatedRoute,
    private utilService: UtilService,
    private soap: NgxSoapService,
    private translateService: TranslateService
  ) {
    this.route.queryParams.subscribe(params => {
      if (params && params.podrep) {
        this.podReportId = params.podrep;
        this.getPodRepData();
      } else {
        const stopId = localStorage.getItem('activeRouteId');
        if (stopId !== 'null') {
          this.podReportId = stopId;
          this.getPodRepData();
        }
      }
    });
  }

  ngOnInit() {
  }

  async getPodRepData() {
    await this.utilService.showLoading();
    this.routesService.getPodReport(this.podReportId).subscribe((resp: any) => {
      this.utilService.dismissLoading();
      this.podReportDetails = resp;
    }, (err: any) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    })
  }

  sendMail() {
    this.translateService.get(['COMMON.CONFIRMATION', 'COMMON.SENT_MAIL_CONFIRMATION']).subscribe((res: any) => {
      this.utilService.showConfirmationPopup(res['COMMON.CONFIRMATION'], res['COMMON.SENT_MAIL_CONFIRMATION'], async cb => {
        if (cb == 1) {
          let value = `
      <![CDATA[<PARAM>
        <FLD NAME='I_XPODNUM'>${this.podReportDetails[0].XPODREF_0}</FLD>
        <FLD NAME='I_XSDHNUM'>${this.podReportDetails[0].XDOCNUM_0}</FLD> 
        <FLD NAME='I_XCUS'>${this.podReportDetails[0].XBPCORD_0}</FLD>
        <FLD NAME='I_XEXTEMAIL'>bharath.e@tema-systems.com</FLD>
      </PARAM>]]>
        `;
          await this.utilService.showLoading();
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
                $value: 'X10AWRKREP'
              },
              inputXml: {
                attributes: {
                  'xsi:type': "xsd:string"
                },
                $xml: value
              }
            }).subscribe((res: ISoapMethodResponse) => {
              this.utilService.showToast('Mail sent successfully.')
              this.utilService.dismissLoading();
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