import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
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
  selector: 'app-litigation',
  templateUrl: './litigation.page.html',
  styleUrls: ['./litigation.page.scss'],
})
export class LitigationPage implements OnInit {
  documentDetails: any;
  litigationForm: FormGroup;
  isFormSubmitted: boolean = false;
  imgArray: any = [];
  incidentReasons: any;
  note: any = '';
  signPageData: any = '';

  constructor(
    private modalController: ModalController,
    private formBuildder: FormBuilder,
    private utilService: UtilService,
    private soap: NgxSoapService,
    private translateService: TranslateService,
    private routesService: RoutesService
  ) { }

  ngOnInit() {
    this.litigationForm = this.formBuildder.group({
      reason: ["", [Validators.required]],
      comment: ["", [Validators.required]]
    });
    this.getIncidentReasons();
  }

  async getIncidentReasons() {
    await this.utilService.showLoading();
    this.routesService.incidentReasons().subscribe((resp) => {
      this.incidentReasons = resp;
      this.utilService.dismissLoading();
    }, (err) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  captureImage() {
    if (this.imgArray.length < 6) {
      this.utilService.showImageActionSheet('', async result => {
        if (result) {
          this.utilService.pickCamera(result, async imageData => {
            this.imgArray.push(imageData);
          });
        }
      })
    } else {
      this.utilService.showToast("Maximum 6 images allowed.");
    }
  }

  removeImage(index) {
    this.imgArray.splice(index, 1);
  }

  submit() {
    this.isFormSubmitted = true;
    if (this.litigationForm.valid) {
      this.translateService.get(['STOP.INCIDENT', 'STOP.INCIDENT_SUBMIT_CONFIRMATION', 'STOP.INCIDENT_SENT_SUCCESSFULLY']).subscribe((languageRes: any) => {
        this.utilService.showConfirmationPopup(languageRes['STOP.INCIDENT'], languageRes['STOP.INCIDENT_SUBMIT_CONFIRMATION'], async cb => {
          if (cb == 1) {
            await this.utilService.showLoading();

            let value = `
          <![CDATA[<PARAM>
            <GRP ID="GRP1">
             <FLD NAME='I_XDOCNUM'>${this.documentDetails[0]?.XDOCNUM_0}</FLD>
             <FLD NAME='I_XDOCTYP'>${this.documentDetails[0]?.XDOCTYP_0}</FLD>
             <FLD NAME='I_XTEXT'>${this.litigationForm.value.comment}</FLD>
             <FLD NAME='I_XREASON'>${this.litigationForm.value.reason}</FLD>
            </GRP>
            <TAB DIM="6" ID="GRP2" SIZE="${this.imgArray.length}">`;
            if (this.imgArray.length > 0) {
              this.imgArray.forEach((image, index) => {
                value += `\n\t<LIN NUM="${index + 1}">
                 <FLD NAME='I_XIMG'>${image}</FLD>
               </LIN>`;
              });
            }
            value += `
          </TAB></PARAM>]]>\n`;

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
                  $value: 'X10AINCDEN'
                },
                inputXml: {
                  attributes: {
                    'xsi:type': "xsd:string"
                  },
                  $xml: value
                }
              }).subscribe((res: ISoapMethodResponse) => {
                this.utilService.dismissLoading();
                this.utilService.showToastSucccess(languageRes['STOP.INCIDENT_SENT_SUCCESSFULLY']);
                this.modalController.dismiss();
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
