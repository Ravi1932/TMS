import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { ISoapMethodResponse, NgxSoapService, security } from 'ngx-soap';
import { environment } from 'src/environments/environment';

const callcontent = `
      <codeLang xsi:type="xsd:string">${environment.soapLanguage}</codeLang>
      <poolAlias xsi:type="xsd:string">${environment.soapPoolAlias}</poolAlias>
      <poolId xsi:type="xsd:string">?</poolId>
      <requestConfig xsi:type="xsd:string">?</requestConfig>
`;

@Component({
  selector: 'app-lot-entry',
  templateUrl: './lot-entry.page.html',
  styleUrls: ['./lot-entry.page.scss'],
})
export class LotEntryPage implements OnInit {
  @Input() productDetail: any;
  lotEntryForm: FormGroup;
  isLotEntryFormSubmitted: boolean = false;

  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private utilService: UtilService,
    private soap: NgxSoapService,
  ) { }

  ngOnInit() {
    this.lotEntryForm = this.formBuilder.group({
      lot_entry: ["", [Validators.required]]
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  async submit() {
    this.isLotEntryFormSubmitted = true;
    if (this.lotEntryForm.valid) {
      await this.utilService.showLoading();
      let value = `
        <![CDATA[<PARAM>
          <GRP ID="GRP1">
          <FLD NAME='I_XPTHNUM'>${this.productDetail.XDOCNUM_0}</FLD>
          <FLD NAME='I_XPODREF'>${this.productDetail.XPODREF_0}</FLD>
          <FLD NAME='I_XLINNUM'>${this.productDetail.LINENO_0}</FLD>
          </GRP>
          <TAB DIM="99" ID="GRP2" SIZE="1">
          <LIN NUM="1">
            <FLD NAME='I_XLOT'>${this.lotEntryForm.value.lot_entry}</FLD>
          </LIN>
          </TAB>
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
            $value: 'X10APTHLOT'
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
            if (result[0].$value == 2) {
              this.utilService.showToastSucccess(result[1].$value);
              this, this.modalController.dismiss();
            } else {
              this.utilService.showToast(result[1].$value);
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
    }
  }
}
