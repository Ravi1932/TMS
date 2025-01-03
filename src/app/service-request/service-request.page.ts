import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { UtilService } from '../services/util.service';
import * as moment from 'moment';
import { ISoapMethodResponse, NgxSoapService, security } from 'ngx-soap';
import { Router } from '@angular/router';

const callcontent = `
      <codeLang xsi:type="xsd:string">${environment.soapLanguage}</codeLang>
      <poolAlias xsi:type="xsd:string">${environment.soapPoolAlias}</poolAlias>
      <poolId xsi:type="xsd:string">?</poolId>
      <requestConfig xsi:type="xsd:string">?</requestConfig>
`;

@Component({
  selector: 'app-service-request',
  templateUrl: './service-request.page.html',
  styleUrls: ['./service-request.page.scss'],
})
export class ServiceRequestPage implements OnInit {
  public requestForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private utilService: UtilService,
    private soap: NgxSoapService,
    private router: Router
  ) {
    this.setupForm();
  }

  ngOnInit() {
    this.addNewProduct(true);
  }

  setupForm() {
    const date = moment().toISOString();
    const resDate = moment().add(1, 'day').toISOString();
    this.requestForm = this.fb.group({
      site: ['BSV01 - Bestvetsolutions - Ellsworth', [Validators.required]],
      customer: ['TY001 - Tyson', [Validators.required]],
      date: [date, [Validators.required]],
      time: [date, [Validators.required]],
      address: ['CORP', [Validators.required]],
      city: ['Eldora', [Validators.required]],
      zipcode: ['50627', [Validators.required]],
      base: ['MACBSV010003', [Validators.required]],
      basePro: ['EDI068 - Pump', [Validators.required]],
      qty: ['1 - UN', [Validators.required]],
      skill: ['PBL1500001000 - Installation', [Validators.required]],
      empcode: ['JOHN -  John Wick', [Validators.required]],
      resdate: [resDate, [Validators.required]],
      products: this.fb.array([])
    });
    // this.requestForm = this.fb.group({
    //   site: ['', [Validators.required]],
    //   customer: ['', [Validators.required]],
    //   date: ['', [Validators.required]],
    //   time: ['', [Validators.required]],
    //   address: ['', [Validators.required]],
    //   city: ['', [Validators.required]],
    //   zipcode: ['', [Validators.required]],
    //   base: ['', [Validators.required]],
    //   basePro: ['', [Validators.required]],
    //   qty: ['', [Validators.required]],
    //   skill: ['', [Validators.required]],
    //   empcode: ['', [Validators.required]],
    //   resdate: ['', [Validators.required]],
    //   products: this.fb.array([])
    // })
  }

  get productForm() {
    return this.requestForm.get('products') as FormArray;
  }

  createProductForm(data: any = {}): FormGroup {
    return this.fb.group({
      type: [data?.type, [Validators.required]],
      consumption: [data?.consumption, [Validators.required]],
      qty: [data?.qty, [Validators.required]],
      unit: [data?.unit, [Validators.required]]
    });
  }

  addNewProduct(isDefault: boolean = false) {
    if (isDefault) {
      this.productForm.push(this.createProductForm({
        type: '1 (Part)',
        consumption: 'ELF072 - Zip Clamp',
        qty: 5,
        unit: 'UN'
      }));
      this.productForm.push(this.createProductForm({
        type: '2 (Labour)',
        consumption: 'ELF079 - General Service Check',
        qty: 2,
        unit: 'HR'
      }));
    } else {
      this.productForm.push(this.createProductForm());
    }
  }

  removeProduct(index: number) {
    this.productForm.removeAt(index);
  }

  async onCreateRequest() {
    if (this.requestForm.valid) {
      this.utilService.showConfirmationPopup('Confirmation', 'Are you sure you want to create request', async cb => {
        if (cb == 1) {
          await this.utilService.showLoading();
          const formValue = this.requestForm.value;
          const userId = localStorage.getItem('podDriverId');
          // let value = `<![CDATA[<PARAM>
          //                 <FLD NAME="I_XSALFCY" TYPE="Char">${formValue.site}</FLD>
          //                 <FLD NAME="I_XBPCNUM" TYPE="Char">${formValue.customer}</FLD>
          //                 <FLD NAME="I_XDATE" TYPE="Char">${moment(formValue.date).format('YYYYMMDD')}</FLD>
          //                 <FLD NAME="I_XTIME" TYPE="Char">${moment(formValue.time).format('HHmm')}</FLD>
          //                 <FLD NAME="I_XADR" TYPE="Char">${formValue.address}</FLD>
          //                 <FLD NAME="I_XCTY" TYPE="Char">${formValue.city}</FLD>
          //                 <FLD NAME="I_XPOSCOD" TYPE="Char">${formValue.zipcode}</FLD>
          //                 <FLD NAME="I_XUSERID" TYPE="Char">${userId}</FLD>
          //                 <FLD NAME="I_XBASE" TYPE="Char">${formValue.base}</FLD>
          //                 <FLD NAME="I_XBASPRO" TYPE="Char">${formValue.basePro}</FLD>
          //                 <FLD NAME="I_XQTY" TYPE="Char">${formValue.qty}</FLD>
          //                 <FLD NAME="I_XSKILL" TYPE="Char">${formValue.skill}</FLD>
          //                 <FLD NAME="I_XEMPCODE" TYPE="Char">${formValue.empcode}</FLD>
          //                 <FLD NAME="I_XRESDATE" TYPE="Char">${moment(formValue.resdate).format('YYYYMMDD')}</FLD>
          //               <TAB DIM="100" ID="GRP2" SIZE="${formValue.products.length}">`;
          let value = `<![CDATA[<PARAM>
            <FLD NAME="I_XSALFCY" TYPE="Char">BSV01</FLD>
            <FLD NAME="I_XBPCNUM" TYPE="Char">TY001</FLD>
            <FLD NAME="I_XDATE" TYPE="Char">${moment(formValue.date).format('YYYYMMDD')}</FLD>
            <FLD NAME="I_XTIME" TYPE="Char">${moment(formValue.time).format('HHmm')}</FLD>
            <FLD NAME="I_XADR" TYPE="Char">CORP</FLD>
            <FLD NAME="I_XCTY" TYPE="Char">Eldora</FLD>
            <FLD NAME="I_XPOSCOD" TYPE="Char">50627</FLD>
            <FLD NAME="I_XUSERID" TYPE="Char">${userId}</FLD>
            <FLD NAME="I_XBASE" TYPE="Char">MACBSV010003</FLD>
            <FLD NAME="I_XBASPRO" TYPE="Char">EDI068</FLD>
            <FLD NAME="I_XQTY" TYPE="Char">1</FLD>
            <FLD NAME="I_XSKILL" TYPE="Char">PBL1500001000</FLD>
            <FLD NAME="I_XEMPCODE" TYPE="Char">JOHN</FLD>
            <FLD NAME="I_XRESDATE" TYPE="Char">${moment(formValue.resdate).format('YYYYMMDD')}</FLD>
          <TAB DIM="100" ID="GRP2" SIZE="2">
          <LIN NUM="1">
            <FLD NAME="I_XCONSTYP" TYPE="Char">2</FLD>
            <FLD NAME="I_CONSUMPTION" TYPE="Char">ELF072</FLD>
            <FLD NAME="I_CONQTY" TYPE="Char">5</FLD>
            <FLD NAME="I_XUNIT" TYPE="Char">UN</FLD>
          </LIN>
          <LIN NUM="2">
            <FLD NAME="I_XCONSTYP" TYPE="Char">3</FLD>
            <FLD NAME="I_CONSUMPTION" TYPE="Char">ELF079</FLD>
            <FLD NAME="I_CONQTY" TYPE="Char">2</FLD>
            <FLD NAME="I_XUNIT" TYPE="Char">HR</FLD>
          </LIN>
          </TAB></PARAM>]]>`;

          // formValue.products.forEach((prd, index) => {
          //   value += `<LIN NUM="${index + 1}">
          //               <FLD NAME="I_XCONSTYP" TYPE="Char">${prd.type}</FLD>
          //               <FLD NAME="I_CONSUMPTION" TYPE="Char">${prd.consumption}</FLD>
          //               <FLD NAME="I_CONQTY" TYPE="Char">${prd.qty}</FLD>
          //               <FLD NAME="I_XUNIT" TYPE="Char">${prd.unit}</FLD>
          //             </LIN>`;
          // });
          // value += `</TAB></PARAM>]]>`;
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
                $value: 'X1CSRECRE'
              },
              inputXml: {
                attributes: {
                  "xsi:type": "xsd:string"
                },
                $xml: value
              }
            }).subscribe((res: ISoapMethodResponse) => {
              this.utilService.dismissLoading();
              if (res.result.runReturn.resultXml?.$value) {
                const result = res.result.runReturn.resultXml.$value.RESULT.GRP[1].FLD;
                if (result[1].$value == 2) {
                  this.router.navigate(['/home']).then(() => {
                    this.utilService.showToastSucccess(`Service request (${result[0].$value}) created successfully.`);
                  })
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
      });
    }
  }
}
