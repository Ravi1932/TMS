import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutesService } from 'src/app/services/routes.service';
import { UtilService } from 'src/app/services/util.service';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { validate } from 'uuid';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.page.html',
  styleUrls: ['./add-product.page.scss'],
})
export class AddProductPage implements OnInit {
  partsList;
  serviceList;
  stopId;
  ID;
  selectedPart;
  selectedService;
  routeId;
  site;
  isFlag = false;
  isLoading = false;
  installBaseListDetailsPart = [];
  installBaseListDetailsServices;
  selectPart;
  select: any;
  installDetail;
  departureTime;
  selectedUnits: string[] = [];
  selectedServiceUnits: string[] = [];
  public emailForm: FormGroup;
  public externalProductForm: FormGroup;
  public externalForm: FormGroup;
  vehicleType;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private routesService: RoutesService,
    private utilService: UtilService,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder) {
    this.route.queryParams.subscribe(params => {
      this.stopId = params.stop;
      this.ID = params.Id;
    });

    this.site = localStorage.getItem('activeSite');
    this.routeId = localStorage.getItem('activeRouteId');
    this.installDetail = JSON.parse(localStorage.getItem('installBase'));
    this.departureTime = localStorage.getItem('departureTime');
  }

  ionViewWillEnter() {
    this.getInstallBaseListDetail();
  }

  ngOnInit() {
    this.initProductForm();
  }

  initProductForm() {
    this.emailForm = this.formBuilder.group({
      emails: this.formBuilder.array([this.createEmailFormGroup()]),
      services: this.formBuilder.array([this.createServiceFormGroup()])
    });
  }

  ionChange(ev, index) {
    this.isFlag = true;
  }

  selectUnit(event: any, index: number) {
    const selectedProduct = event;
    if (selectedProduct && selectedProduct.PCU_0) {
      this.selectedUnits[index] = selectedProduct.PCU_0;
    } else {
      this.selectedUnits[index] = '';
    }
  }

  selectServiceUnit(event: any, index: number) {
    const selectedService = event;
    if (selectedService && selectedService.STU_0) {
      this.selectedServiceUnits[index] = selectedService.STU_0;
    } else {
      this.selectedServiceUnits[index] = '';
    }
  }

  getInstallBaseListDetail() {
    if (this.utilService.isOnline) {
      const params = {
        id: this.stopId,
        instabaseId: this.ID
      }
      this.routesService.installBaseDetails(params).subscribe((resp: any) => {
        this.utilService.showLoading();
        if (resp != null) {
          this.installBaseListDetailsPart = resp.part;
          this.installBaseListDetailsServices = resp.service;
        }
        this.getPartsList();
        this.getServices();
      }, (err: any) => {
        this.utilService.dismissLoading();
        this.utilService.showErrorCall(err);
      });
    } else {
      this.routesService.installBase(this.stopId).subscribe(installBaseList => {
        this.installBaseListDetailsPart = installBaseList[0].part;
        this.installBaseListDetailsServices = installBaseList[0].service;
      });
      this.getPartsList();
      this.getServices();
    }
  }

  getEmailsFormArrayControls(): AbstractControl[] {
    return (this.emailForm.get('emails') as FormArray).controls;
  }
  getEmailProductFormControl(email: AbstractControl): FormControl {
    return email.get('productName') as FormControl;
  }
  getEmailQtyFormControl(email: AbstractControl): FormControl {
    return email.get('qty') as FormControl;
  }
  getFormQTYValidation(index) {
    const email = this.emailForm.value.emails[index];
    if (!email || !email.productName || !email.qty) {
      return false;
    }
    const part = email.productName;
    const qty = email.qty;
    return part.QTY < qty ? true : false;
  }

  getServiceFormArrayControls(): AbstractControl[] {
    return (this.emailForm.get('services') as FormArray).controls;
  }

  getServiceProductFormControl(email: AbstractControl): FormControl {
    return email.get('serviceName') as FormControl;
  }

  public addEmailFormGroup() {
    const emails = this.emailForm.get('emails') as FormArray
    emails.push(this.createEmailFormGroup())
  }

  public removeOrClearEmail(i: number) {
    const emails = this.emailForm.get('emails') as FormArray;
    if (emails.length > 1) {
      emails.removeAt(i);
    } else {
      emails.reset();
    }
    this.cdr.detectChanges()
  }

  public addServiceFormGroup() {
    const emails = this.emailForm.get('services') as FormArray
    emails.push(this.createServiceFormGroup())
  }

  public removeOrClearService(i: number) {
    const emails = this.emailForm.get('services') as FormArray;
    if (emails.length > 1) {
      const firstService = emails.at(0).get('serviceName');
      if (firstService) {
        firstService.enable();
        emails.removeAt(i);
      }
    } else {
      emails.reset();
    }
  }

  private createEmailFormGroup(): FormGroup {
    return new FormGroup({
      'productName': new FormControl('', Validators.required),
      'qty': new FormControl('', [Validators.required, Validators.pattern(/^\d+$(\.\d{1,2})?$/)]),
      'isInvalidQTY': new FormControl(false)
    })
  }

  private createServiceFormGroup(): FormGroup {
    return new FormGroup({
      'serviceName': new FormControl('', Validators.required),
    })
  }


  getPartsList() {
    this.routesService.getParts(this.routeId).subscribe((resp: any) => {
      if (resp.length === 0) {
        this.routesService.getPartList(this.routeId).subscribe((resp: any) => {
          this.partsList = resp;
        })
      }
      this.installBaseListDetailsPart?.map((x, index) => {
        resp.map(y => {
          if (x.Product == y.ITMREF_0) {
            // y.disabled = true;
            y.isError = false;
          }
        })
      });
      this.partsList = resp;
    }, (err: any) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    })
  }

  async getServices() {
    this.routesService.getServices(this.site).subscribe((resp: any) => {
      this.utilService.dismissLoading();
      this.installBaseListDetailsServices?.map((x) => {
        resp.map(y => {
          if (x.Product == y.ITMREF_0) {
            // y.disabled = true;
          }
        })
      });
      this.serviceList = resp;
    }, (err: any) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    })
  }

  onSubmit() {
    let routeId = localStorage.getItem('activeRouteId');
    const params = {
      ServiceRequest: this.stopId,
      baseNumber: this.ID,
      routeId: routeId
    }
    let lineNumber;
    let customAddProduct: any = [params];
    this.utilService.showLoading();
    this.routesService.addLineNumber(params).subscribe(async (res) => {
      setTimeout(() => {
        this.utilService.dismissLoading();
      }, 200);
      if (res && res != null) {
        lineNumber = res;
      } else {
        lineNumber = 1;
      }
      if (this.emailForm.value.emails) {
        this.isLoading = true;
        for (let i = 0; i < this.emailForm.value.emails.length; i++) {
          if (this.emailForm.value.emails[i].productName && this.emailForm.value.emails[i].qty) {
            const params = {
              ServiceRequest: this.stopId,
              baseNumber: this.ID,
              line_number: lineNumber,
              XDRN_0: routeId,
              Product: this.emailForm.value.emails[i].productName.ITMREF_0,
              descrition: this.emailForm.value.emails[i].productName.ITMDES1_0,
              XTYPE_0: 2,
              QTY_0: Number(this.emailForm.value.emails[i].qty),
              UOM_0: this.emailForm.value.emails[i].productName.PCU_0,
              Type: this.vehicleType
            };
            customAddProduct.push(params);
            let storeThisData = false;
            if (i == this.emailForm.value.emails.length - 1) {
              storeThisData = true;
            }
            const obj = {
              routeId: routeId,
              USED_QTY_0: this.emailForm.value.emails[i].qty,
              ACTUAL_QTY: this.emailForm.value.emails[i].productName.USEDQTY_0,
              Product: this.emailForm.value.emails[i].productName.ITMREF_0
            }
            this.routesService.updateQuantity(obj).subscribe(resp => {
              if (this.utilService.isOnline) {
                if (resp[0] == 1) {
                  this.routesService.addProduct(params, storeThisData, customAddProduct).subscribe(res => {
                    this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details'], { queryParams: { podId: this.stopId } }).then(() => {
                      this.initProductForm();
                    });
                  });
                }
              } else {
                this.routesService.addProduct(params, storeThisData, customAddProduct).subscribe(res => {
                  this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details'], { queryParams: { podId: this.stopId } }).then(() => {
                    this.initProductForm();
                  });
                });
              }
            })
            lineNumber++;
          }
        }
      }


      if (this.emailForm.value.services && this.emailForm.value.services[0].serviceName !== "") {
        this.isLoading = true;
        for (let i = 0; i < this.emailForm.value.services.length; i++) {
          if (this.emailForm.value.services[i].serviceName) {
            const params: any = {
              ServiceRequest: this.stopId,
              baseNumber: this.ID,
              line_number: lineNumber,
              XDRN_0: routeId,
              Product: this.emailForm.value.services[i].serviceName.ITMREF_0,
              descrition: this.emailForm.value.services[i].serviceName.ITMDES1_0,
              XTYPE_0: 3,
              QTY_0: 0,
              UOM_0: this.emailForm.value.services[i].serviceName.STU_0,
              Type: this.vehicleType
            };
            customAddProduct?.push(params);
            let storeThisData = false;
            if (i == this.emailForm.value.services.length - 1) {
              storeThisData = true;
            }
            this.routesService.addProduct(params, storeThisData, customAddProduct).toPromise();
            this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details'], { queryParams: { podId: this.stopId } }).then(() => {
              this.initProductForm();
              // this.utilService.showToastSucccess('Parts and Services were added successfully');
            });
            lineNumber++;
          }
        }
      }

      this.utilService.showToastSucccess('Parts and Services were added successfully');
    })

  }

  isFormPartDisabled(): boolean {
    const checkProductName = this.emailForm.value.emails.some(
      (email, index) => email.productName == '' || email.productName == null
    );
    const checkQTY = this.emailForm.value.emails.some(
      (email, index) => email.qty == '' || email.qty == null || email.qty < 0
    );
    const checkQTYIntoRealQTY = this.emailForm.value.emails.some(
      (email, index) => !this.getFormQTYValidation(index)
    );
    const checkService = this.emailForm.value.services.some(
      (email, index) => email.serviceName == '' || email.serviceName == null
    );
    let checkDisabled = true;
    if (!checkService && checkProductName && checkQTY && checkQTYIntoRealQTY) {
      checkDisabled = false;
    } else if (!checkProductName && !checkQTY && checkQTYIntoRealQTY && !checkService) {
      checkDisabled = false;
    } else if (!checkProductName && !checkQTY && checkQTYIntoRealQTY && checkService) {
      checkDisabled = false;
    }
    return checkDisabled
  }

  isPartDisabled(part: any): boolean {
    return this.getEmailsFormArrayControls().some(parts => {
      const selectedPart = this.getEmailProductFormControl(parts).value;
      return selectedPart && selectedPart.ITMREF_0 === part.ITMREF_0;
    });
  }

  isServiceDisabled(service: any): boolean {
    return this.getServiceFormArrayControls().some(services => {
      const selectedService = this.getServiceProductFormControl(services).value;
      return selectedService && selectedService.ITMREF_0 === service.ITMREF_0 && selectedService.ITMDES1_0 === service.ITMDES1_0;
    });
  }

  onBack() {
    this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details'], { queryParams: { podId: this.stopId } });
  }

  goToHome() {
    this.router.navigate(['tabs/routes']);
  }

}
