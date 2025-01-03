import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavParams } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ISoapMethodResponse, NgxSoapService, security } from 'ngx-soap';
import { UtilService } from 'src/app/services/util.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-edit-qty',
  templateUrl: './edit-qty.page.html',
  styleUrls: ['./edit-qty.page.scss'],
})
export class EditQtyPage implements OnInit {
  qtyForm: FormGroup;
  stopData: any;
  maxLength: any = '';
  callContent: any;
  routesData: any;
  documentDetails: any;

  constructor(
    private modalController: ModalController,
    private params: NavParams,
    private utilService: UtilService,
    private soap: NgxSoapService,
    private router: ActivatedRoute,
    private fb: FormBuilder,
    private translateService: TranslateService
  ) {
    this.stopData = params.get('signPageData');
    this.callContent = params.get('callcontent');
    this.routesData = params.get('routesData');
    this.documentDetails = params.get('documentDetails');
    this.maxLength = this.stopData.QTY_0;
  }

  ngOnInit() {
    this.qtyForm = this.fb.group({
      qty: [this.stopData.updateQty, [Validators.required, Validators.max(this.maxLength), Validators.min(1)]]
    })
  }

  async save() {
    if (this.qtyForm.valid) {
      this.translateService.get(['COMMON.CHANGE_QUANTITY', 'COMMON.CHANGE_QUANTITY_CONFIRMATION']).subscribe((languageRes: any) => {
        this.utilService.showConfirmationPopup(languageRes['COMMON.CHANGE_QUANTITY'], languageRes['COMMON.CHANGE_QUANTITY_CONFIRMATION'], async cb => {
          if (cb == 1) {
            for (let index = 0; index < this.documentDetails.length; index++) {
              const element = this.documentDetails[index];
              if (this.stopData.ITMREF_0 == element.ITMREF_0) {
                element.QTY_0 = Number(this.qtyForm.value.qty);
              }
            }
            let value = `
            <![CDATA[<PARAM>
            <TAB DIM="300" ID="SDH1_4" SIZE="${this.documentDetails.length}">`;
            if (this.documentDetails.length > 0) {
              this.documentDetails.forEach((prd, index) => {
                value += ` 
            <LIN NUM="${index + 1}">
              <FLD NAME="ITMREF">${prd.ITMREF_0}</FLD>
              <FLD NAME="QTY">${prd.QTY_0}</FLD>
            </LIN>`;
              });
              value += `
            </TAB></PARAM>]]>`;
              await this.utilService.showLoading();
              this.soap.createClient(environment.soap + '/soap-wsdl/syracuse/collaboration/syracuse/CAdxWebServiceXmlCC?wsdl', {
                attributesKey: 'attributes', valueKey: '$value', xmlKey: '$xml'
              }).then(client => {
                client.setSecurity(new security.BasicAuthSecurity(environment.soapUsername, environment.soapPassword, ''))
                client.call('modify', {
                  callContext: {
                    $xml: this.callContent,
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
                      $value: `${this.stopData.XDOCNUM_0}`
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
                  this.modalController.dismiss(this.qtyForm.value);
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
          }
        });
      });
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
