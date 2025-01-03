import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RoutesService } from 'src/app/services/routes.service';
import { UtilService } from 'src/app/services/util.service';
import { environment } from 'src/environments/environment';
import { ISoapMethodResponse, NgxSoapService, security } from 'ngx-soap';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { uniq, cloneDeep, findIndex, sortBy } from 'lodash';

const callcontent = `
      <codeLang xsi:type="xsd:string">${environment.soapLanguage}</codeLang>
      <poolAlias xsi:type="xsd:string">${environment.soapPoolAlias}</poolAlias>
      <poolId xsi:type="xsd:string">?</poolId>
      <requestConfig xsi:type="xsd:string">?</requestConfig>
`;
@Component({
  selector: 'app-scheduled-service-order',
  templateUrl: './scheduled-service-order.component.html',
  styleUrls: ['./scheduled-service-order.component.scss'],
})
export class ScheduledServiceOrderComponent {
  scheduledForm: FormGroup;
  installBaseForm: FormGroup;
  siteList;
  customerList;
  addressList: any = [];
  installBaseList: any = [];
  skillGroupList;
  driverId;
  isDisabled = true;
  installBaseLists: any = [];
  serviceRequestNo;
  routesId;
  currentDate: string;
  minDate: string;
  productList;

  productsList = [];
  isFlag = false;
  constructor(private routesService: RoutesService,
    private fb: FormBuilder,
    private soap: NgxSoapService,
    private router: Router,
    private utilService: UtilService) {
    this.scheduledForm = this.fb.group({
      site: ['', [Validators.required]],
      customer: ['', [Validators.required]],
      address: ['', [Validators.required]],
      technician: ['', [Validators.required]],
      date: ['', [Validators.required]],
      time: ['', [Validators.required]],
      reference: ['', [Validators.required]],
      routeId: ['']
    });
    this.installBaseForm = this.fb.group({
      installBases: this.fb.array([this.createInstallBaseFormGroup()]),
    });

    const today = new Date();
    today.setDate(today.getDate() + 1);
    const year = today.getFullYear();
    let month: string | number = today.getMonth() + 1;
    let day: string | number = today.getDate();
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    this.currentDate = `${year}-${month}-${day}`;
    this.minDate = this.currentDate;
  }

  ionViewWillEnter() {
    this.installBaseForm = this.fb.group({
      installBases: this.fb.array([this.createInstallBaseFormGroup()]),
    });
    this.driverId = localStorage.getItem('podDriverId');
    this.routesId = localStorage.getItem('activeRouteId');
    this.serviceRequestNo = JSON.parse(localStorage.getItem('serviceRequest'));
    if (this.serviceRequestNo) {
      this.scheduledForm.patchValue({
        routeId: this.routesId
      })
    }
    this.scheduledForm.patchValue({
      date: moment(new Date()).format("YYYY-MM-DD"),
      time: moment(new Date()).format("HH:MM")
    })
    this.scheduledForm.patchValue({
      technician: this.driverId
    })
    this.getSite();
    this.getCustomer();
    this.getSkillGroup();
    this.getProduct();
  }
  generateRandomNumber(): number {
    return Math.floor(Math.random() * 90000000) + 10000000;
  }
  serviceCreation() {
    const offlineServiceNumber = `${this.scheduledForm.value.site.SiteCode}${moment(new Date()).format('YYMM')}${`SRE`}${this.generateRandomNumber()}`;
    this.installBaseForm.value.installBases.map(x => {
      x.products.map(y => {
        this.productsList.push({
          InstallBase: x.installbase.InstallBase,
          Product: y.product.Product,
          qty: y.qty
        })
      })
    })
    const dateWithoutDashes = this.scheduledForm.value.date.replace(/-/g, '');
    const timeWithoutColon = this.scheduledForm.value.time.replace(/:/g, '');
    let value = `
          <![CDATA[<PARAM>
          <TAB DIM="100" ID="GRP1" SIZE="${this.installBaseForm.value.installBases.length}">`;
    for (let i = 0; i < this.installBaseForm.value.installBases.length; i++) {
      value += `<LIN NUM="${i + 1}">
        <FLD NAME="I_XFCY" TYPE="Char">${this.scheduledForm.value.site.SiteCode}</FLD>
        <FLD NAME="I_XBPC" TYPE="Char">${this.scheduledForm.value.customer.CustomerCode}</FLD>
        <FLD NAME="I_XBPAADD" TYPE="Char">${this.scheduledForm.value.address.AddressCodes}</FLD>
        <FLD NAME="I_XTECH" TYPE="Char">${this.scheduledForm.value.technician}</FLD>
        <FLD NAME="I_XDATE" TYPE="Char">${dateWithoutDashes}</FLD>
        <FLD NAME="I_XTIME" TYPE="Char">${timeWithoutColon}</FLD>
        <FLD NAME="I_XREF" TYPE="Char">${this.scheduledForm.value.reference}</FLD>
        <FLD NAME="I_XBASE">${this.installBaseForm.value.installBases[i]?.installbase.InstallBase}</FLD>
        <FLD NAME="I_XSKILL">${this.installBaseForm.value.installBases[i]?.skill.GRPPBLNUM_0}</FLD>
        <FLD NAME="I_XROUTNUM">${this.scheduledForm.value.routeId}</FLD>`
      if (!this.utilService.isOnline) {
        value += `
        <FLD NAME="I_XOFFSRENUM" TYPE="Char">${offlineServiceNumber}</FLD>`
      }
      value += `</LIN>`
    }
    value += `</TAB>`
    if (this.productsList.length > 0) {
      value += `<TAB DIM="100" ID="GRP2" SIZE="${this.productsList.length}">`;
      for (let i = 0; i < this.productsList.length; i++) {
        value += `
    <LIN NUM="${i + 1}">
             <FLD NAME="I_XBASEPRO" TYPE="Char">${this.productsList[i].InstallBase}</FLD>
             <FLD NAME="I_XCPNITM" TYPE="Char">${this.productsList[i].Product}</FLD>
             <FLD NAME="I_XCPNQTY" TYPE="Char">${this.productsList[i].qty}</FLD>
          </LIN>`;
      }
      value += `</TAB>`
    }
    value += `</PARAM>]]>\n`;
    if (this.utilService.isOnline) {
      this.utilService.showLoading().then(() => {
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
              $value: 'X10CSRECRE'
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
              const result = res.result.runReturn.resultXml.$value.RESULT.GRP.FLD;
              if (result[1].$value == "2") {
                this.scheduledForm.reset();
                this.installBaseForm.reset();
                this.utilService.showToastSucccess(`Service request ${result[0].$value} created successfully`);
                if (this.serviceRequestNo) {
                  localStorage.removeItem('serviceRequest');
                  this.router.navigate(['/tabs/stop-list'], { queryParams: { route: this.routesId } });
                } else {
                  this.router.navigate(['tabs/layout']);
                }
              } else {
                this.utilService.showToast("Something went wrong. Please try again later.");
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
      });
    } else {
      let installBaseArray = [];
      if (this.serviceRequestNo) {
        localStorage.removeItem('serviceRequest');
        //  this.utilService.showToast("Spot Service request creation will only work if you are online");
        this.utilService.storeApiWebservice('X10CSRECRE', value, 'soap', '', offlineServiceNumber);
        this.utilService.showToastSucccess('Service request created successfully');
        setTimeout(() => {
          this.routesService.getStops(this.routesId).subscribe(async (res: any) => {
            let staticData = cloneDeep(res[0]);
            staticData.XDOCNUM_0 = offlineServiceNumber;
            staticData.Address = this.scheduledForm.value.address.AddressCodes;
            staticData.XBPCORD_0 = this.scheduledForm.value.customer.CustomerCode;
            staticData.XBPNAME_0 = this.addressList[0].BPCNAM_0;
            staticData.XCTY_0 = this.addressList[0].City;
            staticData.XFCYDES_0 = this.scheduledForm.value.site.SiteName;
            staticData.XSTOFCY_0 = this.scheduledForm.value.site.SiteCode;
            staticData.XX10A_BPGEOX_0 = this.addressList[0].Latitude;
            staticData.XX10A_BPGEOY = this.addressList[0].Longitude;
            staticData.Datee = this.scheduledForm.value.date;
            staticData.Timee = this.scheduledForm.value.time;
            staticData.Reference = this.scheduledForm.value.reference;
            staticData.XSTATUS_0 = 2;
            staticData.XCSGNUM_0 = res.length + 1;
            staticData.XARRTIM_0 = ' ';
            staticData.XARRTIM_0 = ' ';
            staticData.XFINTIME_0 = ' ';
            staticData.XDEPDAT_0 = ' ';
            staticData.XDEPTIM_0 = ' ';
            staticData.Mandatory = 1;
            res.push(staticData);
            const data = await this.utilService.getStorageData('stops') ?? {};
            data[this.routesId] = sortBy(res, 'XCSGNUM_0');
            this.utilService.setStorageData('stops', data);

            const dataDocument = await this.utilService.getStorageData('documentInfo') ?? {};
            let firstKey = Object.keys(dataDocument)[0];
            let dataInfo = cloneDeep(dataDocument[firstKey][0]);
            dataInfo.XDOCNUM_0 = offlineServiceNumber;
            dataInfo.MOB_0 = this.addressList[0].Mobile;
            dataInfo.WEB_0 = this.addressList[0].Email;
            dataInfo.XBPCORD_0 = this.scheduledForm.value.customer.CustomerCode;
            dataInfo.XBPNAME_0 = this.addressList[0].BPCNAM_0;
            dataInfo.XX10A_BPGEOX_0 = this.addressList[0].Latitude;
            dataInfo.XX10A_BPGEOY_0 = this.addressList[0].Longitude;
            dataInfo.XCTY_0 = this.addressList[0].City;
            dataInfo.XPOSCOD_0 = this.addressList[0].PostalCode;
            dataDocument[dataInfo.XDOCNUM_0] = [dataInfo];
            this.utilService.setStorageData('documentInfo', dataDocument);

            const PODDet = await this.utilService.getStorageData('podDetail') ?? {};
            let secondKey = Object.keys(PODDet)[0];
            let dataDetail = cloneDeep(PODDet[secondKey][0]);
            dataDetail.XDOCNUM_0 = offlineServiceNumber;
            dataDetail.XBPCORD_0 = this.scheduledForm.value.customer.CustomerCode;
            dataDetail.XBPNAME_0 = this.addressList[0].BPCNAM_0;
            dataDetail.XCTY_0 = this.addressList[0].City;
            dataDetail.XPOSCOD_0 = this.addressList[0].PostalCode;
            dataDetail.XDRN_0 = this.scheduledForm.value.routeId;
            PODDet[dataDetail.XDOCNUM_0] = [dataDetail];
            this.utilService.setStorageData('podDetail', PODDet);

            const documentDet = await this.utilService.getStorageData('documentDetail') ?? {};
            let thirdKey = Object.keys(documentDet)[0];
            let documentDetail = cloneDeep(documentDet[thirdKey][0]);
            documentDetail.XDOCNUM_0 = offlineServiceNumber;
            documentDetail.XBPCORD_0 = this.scheduledForm.value.customer.CustomerCode;
            documentDetail.XBPNAME_0 = this.addressList[0].BPCNAM_0;
            documentDetail.XCTY_0 = this.addressList[0].City;
            documentDetail.XPOSCOD_0 = this.addressList[0].PostalCode;
            documentDetail.XDRN_0 = this.scheduledForm.value.routeId;
            documentDet[documentDetail.XDOCNUM_0] = [documentDetail];
            this.utilService.setStorageData('documentDetail', documentDet);

            const installBase = await this.utilService.getStorageData('installBase') ?? {};
            let fourthKey = Object.keys(installBase)[0];
            for (let i = 0; i < this.installBaseForm.value.installBases.length; i++) {
              let installBaseDetail = cloneDeep(installBase[fourthKey][0]);
              installBaseDetail.Customer = this.scheduledForm.value.customer.CustomerCode;
              installBaseDetail.CustomerName = this.addressList[0].BPCNAM_0;
              installBaseDetail.InstallBase = this.installBaseForm.value.installBases[i].installbase.InstallBase;
              installBaseDetail.RequestNumber = offlineServiceNumber;
              installBaseDetail.SkillDescription = this.installBaseForm.value.installBases[i].skill.GRPPBLNUM_0;
              installBaseDetail.SkillGroup = this.installBaseForm.value.installBases[i].skill.TEXTE_0;
              installBaseArray.push(installBaseDetail);
            }
            installBase[offlineServiceNumber] = installBaseArray;
            this.utilService.setStorageData('installBase', installBase);

            const customer = { ClientCode: this.scheduledForm.value.customer.CustomerCode, ClinetName: this.addressList[0].BPCNAM_0 };
            this.utilService.setStorageData(offlineServiceNumber, customer);

            this.router.navigate(['/tabs/stop-list'], { queryParams: { route: this.routesId } });
          });
        }, 1000);
      } else {
        this.utilService.storeApiIntoPending('X10CSRECRE', value, 'soap', '');
        this.utilService.showToastSucccess('Service request created successfully');
        setTimeout(() => {
          this.router.navigate(['tabs/layout']);
        }, 500);
      }
    }
  }

  getSite() {
    this.routesService.getSiteList().subscribe(res => {
      this.siteList = res;
    }, err => {
      this.utilService.showToast('Something Wrong!');
    });
  }

  getCustomer() {
    this.routesService.getCustomerList(2).subscribe(
      (customerList: any[]) => {
        this.customerList = customerList;
      },
      (error) => {
        console.error('Error fetching customer list:', error);
        this.utilService.showToast('Something went wrong while fetching customer data!');
      }
    );
  }

  getAddress(code) {
    this.routesService.getAddressList(code).subscribe(res => {
      this.addressList = res;
      this.isDisabled = false;
      // this.utilService.setStorageData(code, this.addressList);
    }, err => {
      this.utilService.showToast('Something Wrong!');
    })
  }

  changeLeagueOwner(type: string) {
    if (this.scheduledForm.value.customer) {
      this.getAddress(this.scheduledForm.value.customer.CustomerCode);
      this.getInstallBase(this.scheduledForm.value.customer.CustomerCode);
    }
  }

  getInstallBase(code) {
    this.routesService.getInstallBaseList(code).subscribe(res => {
      if (res) {
        this.installBaseList = res;
        this.utilService.setStorageData(`install${code}`, this.installBaseList);
        this.isDisabled = false;
      } else {
        this.utilService.showToast('Something Wrong!');
      }
    })
  }

  getSkillGroup() {
    this.routesService.getSkillGroup(this.driverId).subscribe(res => {
      if (res) {
        this.skillGroupList = res;
        this.utilService.setStorageData('skill', this.skillGroupList);
      } else {
        this.utilService.showToast('Something Wrong!');
      }
    })
  }

  getProduct() {
    this.routesService.getProductList().subscribe(res => {
      this.productList = res;
    }, err => {
      this.utilService.showToast('Something Wrong!');
    });
  }

  disabledEnabledInstallBase() {
    this.installBaseList.map(x => {
      let finIndex = this.installBaseForm.value.installBases.findIndex(formVal => formVal.installbase.InstallBase == x.InstallBase)
      if (finIndex != -1) {
        x.disabled = true;
      } else {
        x.disabled = false;
      }
    });
  }

  public addInstallBaseFormGroup() {
    const installBases = this.installBaseForm.get('installBases') as FormArray
    installBases.push(this.createInstallBaseFormGroup())
    this.getFormArrayProductsControls(0);
  }

  ionChange(ev, index) {
    this.isFlag = true;
  }

  addProductFormGroup(bookIndex) {
    const products = (this.installBaseForm.get('installBases') as FormArray).at(bookIndex).get('products') as FormArray;
    products.push(this.createProductFormGroup());
  }

  private createInstallBaseFormGroup(): FormGroup {
    return new FormGroup({
      'installbase': new FormControl('', Validators.required),
      'skill': new FormControl('', [Validators.required]),
      'products': this.fb.array([])
    })
  }

  private createProductFormGroup(): FormGroup {
    return new FormGroup({
      'product': new FormControl('', [Validators.required]),
      'qty': new FormControl('', [Validators.required, Validators.pattern(/^\d+$(\.\d{1,2})?$/)])
    })
  }

  getFormArrayControls(): AbstractControl[] {
    return (this.installBaseForm.get('installBases') as FormArray).controls;
  }

  getFormArrayProductsControls(index): AbstractControl[] {
    let control: any = (this.installBaseForm.get('installBases') as FormArray).controls;
    return control[index].controls.products.controls;
  }

  public removeOrClearInstallBase(i: number) {
    const installBases = this.installBaseForm.get('installBases') as FormArray
    if (installBases.length > 1) {
      installBases.removeAt(i)
      this.disabledEnabledInstallBase();
    } else {
      installBases.reset()
    }
  }
  public removeOrClearProduct(i: number, subIndex: number) {
    const products = ((this.installBaseForm.get('installBases') as FormArray).at(i).get('products') as FormArray);
    products.removeAt(subIndex);
  }

  getInstallBaseFormControl(installBase: AbstractControl): FormControl {
    return installBase.get('installbase') as FormControl;
  }

  getSkillFormControl(Skill: AbstractControl): FormControl {
    return Skill.get('skill') as FormControl;
  }

  getProductFormControl(Product: AbstractControl): FormControl {
    return Product.get('product') as FormControl;
  }

  getQtyFormControl(Qty: AbstractControl): FormControl {
    return Qty.get('qty') as FormControl;
  }

  isFormPartDisabled() {
    var isEmailInvalid;
    isEmailInvalid = this.installBaseForm.value.installBases.some(x => {
      return  x.products.some(email => email.qty <= 0);
    })
    return isEmailInvalid;
  }

  onClick() {
    this.serviceRequestNo = JSON.parse(localStorage.getItem('serviceRequest'));
    if (this.serviceRequestNo) {
      localStorage.removeItem('serviceRequest');
      this.router.navigate(['/tabs/stop-list'], { queryParams: { route: this.routesId } });
    } else {
      this.router.navigate(['tabs/layout']);
    }
  }
}
