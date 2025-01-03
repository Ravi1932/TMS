import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ISoapMethodResponse, NgxSoapService, security } from 'ngx-soap';
import { UtilService } from 'src/app/services/util.service';
import { AddNotesPage } from './add-notes/add-notes.page';
import { AddSignaturePage } from './add-signature/add-signature.page';
import * as _ from 'lodash';
import { RoutesService } from 'src/app/services/routes.service';
import { EditQtyPage } from './edit-qty/edit-qty.page';
import { environment } from 'src/environments/environment';
import { LitigationPage } from './litigation/litigation.page';
import { TranslateService } from '@ngx-translate/core';
import { LotEntryPage } from './lot-entry/lot-entry.page';
import * as moment from 'moment';
import { CameraSource } from '@capacitor/camera';
import heic2any from 'heic2any';

const callcontent = `
      <codeLang xsi:type="xsd:string">${environment.soapLanguage}</codeLang>
      <poolAlias xsi:type="xsd:string">${environment.soapPoolAlias}</poolAlias>
      <poolId xsi:type="xsd:string">?</poolId>
      <requestConfig xsi:type="xsd:string">?</requestConfig>
`;

@Component({
  selector: 'app-capture-details',
  templateUrl: './capture-details.page.html',
  styleUrls: ['./capture-details.page.scss'],
})
export class CaptureDetailsPage implements OnInit {
  // @Input() stopsDetails;
  isDisabled: boolean = false;
  utilService$ = this.utilService;
  note: string = '';
  imgArray: any = [
    {
      label: '1. Hour Meter',
      image: ''
    },
    {
      label: '2. Data Tag',
      image: ''
    },
    {
      label: '3. 4 - Corners',
      image: ''
    },
    {
      label: '4. Picture of Problem',
      image: ''
    }
  ];
  imageUploadIndex: number = 0;
  signPageData = {
    name: '',
    rating: 1,
    signature: '',
    hours: 0,
    minutes: 0
  };
  notePageData;
  stopId;
  documentDetails: any[] = [];
  routesData: any;
  installBaseList: any = [];
  installBaseListDetailsPart;
  installBaseListDetailsServices: any[] = [];
  I_XSDHNUM;
  site;
  code;
  departureTime;
  currentStop;
  isInvalid: boolean = false;
  isRequired: boolean = false;
  constructor(
    private modalController: ModalController,
    private utilService: UtilService,
    private router: Router,
    private soap: NgxSoapService,
    private route: ActivatedRoute,
    private routesService: RoutesService,
    private translateService: TranslateService,
    private routeService: RoutesService,
  ) {
    this.site = localStorage.getItem('activeSite');
    this.code = localStorage.getItem('customerCode');
    this.departureTime = localStorage.getItem('departureTime');
    this.currentStop = JSON.parse(localStorage.getItem('currentStop'));
    this.customerSurveyDisabled();
    if (this.currentStop.Mandatory == 2) {
      this.isRequired = true;
    } else if (this.currentStop.Mandatory == 3) {
      if (this.currentStop.Interval == 1 && this.currentStop.XCSGNUM_0 == 1000) {
        this.isRequired = true;
      } else if (this.currentStop.Interval == 2 && (this.currentStop.XCSGNUM_0 == 1000 || this.currentStop.XCSGNUM_0 == 2000)) {
        this.isRequired = true;
      } else if (this.currentStop.Interval == 3 && (this.currentStop.XCSGNUM_0 == 1000 || this.currentStop.XCSGNUM_0 == 2000 || this.currentStop.XCSGNUM_0 == 3000)) {
        this.isRequired = true;
      } else {
        this.isRequired = false;
      }
    }
  }

  customerSurveyDisabled() {
    this.utilService.customerSurvey.subscribe(res => {
      this.isInvalid = res;
    })
    if (this.currentStop.Mandatory == 1) {
      this.isInvalid = false;
    } else if (this.currentStop.Mandatory == 2) {
      this.isInvalid = true;
    } else if (this.currentStop.Mandatory == 3) {
      if (this.currentStop.Interval == 1 && this.currentStop.XCSGNUM_0 == 1000) {
        this.isInvalid = true;
      } else if (this.currentStop.Interval == 2 && (this.currentStop.XCSGNUM_0 == 1000 || this.currentStop.XCSGNUM_0 == 2000)) {
        this.isInvalid = true;
      } else if (this.currentStop.Interval == 3 && (this.currentStop.XCSGNUM_0 == 1000 || this.currentStop.XCSGNUM_0 == 2000 || this.currentStop.XCSGNUM_0 == 3000)) {
        this.isInvalid = true;
      } else {
        this.isInvalid = false;
      }
    }
  }

  ionViewWillEnter() {
    const currentStop = JSON.parse(localStorage.getItem('currentStop'));
    if (currentStop && currentStop.XFINTIME_0 && currentStop.XFINTIME_0.trim() !== "") {
      this.isDisabled = true;
    } else {
      this.isDisabled = false;
    }
    const params = this.route.snapshot.queryParams;
    if (params && params.podId) {
      this.stopId = params.podId;
      setTimeout(() => {
        this.getInstallBase();
      }, 1000);
    } else {
      this.utilService.getStorageData('stopId').then(data => {
        this.stopId = data;
      });
    }
  }

  ngOnInit() {
  }

  getInstallBase() {
    this.utilService.showLoading();
    this.routesService.installBase(this.stopId).subscribe(installBaseList => {
      this.installBaseList = installBaseList;
      if (this.utilService.isOnline) {
        this.installBaseList.forEach((x) => {
          this.routesService.installBaseDetails({ id: this.stopId, instabaseId: x.InstallBase }).subscribe(async (resp: any) => {
            this.utilService.dismissLoading();
            this.installBaseListDetailsPart = resp.part;
            this.installBaseListDetailsServices = resp.service;
            x.part = this.installBaseListDetailsPart;
            x.service = this.installBaseListDetailsServices;
            if (this.utilService.isOnline) {
              const installBases = (await this.utilService.getStorageData('installBase'));
              installBases[this.stopId] = this.installBaseList;
              await this.utilService.setStorageData('installBase', installBases);
            }
          }, (err: any) => {
            this.utilService.dismissLoading();
            this.utilService.showErrorCall(err);
          });
        });
      }
      setTimeout(() => {
        this.utilService.dismissLoading();
      }, 500);
    }, (err: any) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    })
  }

  isButtonDisabled(): boolean {
    for (let record of this.installBaseList) {
      if (record.service.length > 0) {
        for (let service of record.service) {
          if (service.XFLAG_0 === 2 && (!service.Duration || service.Duration.trim() === '')) {
            return true;
          }
        }
      } else {
        return true;
      }
    }
    return false;
  }
  // isButtonDisabled(){
  //   return this.data.service.some(service => 
  //     (!service.Duration || service.Duration.trim() === '') && service.XFLAG_0 !== 2
  // );
  //  }
  async getDocumentDetails() {
    await this.utilService.showLoading();
    this.routesService.getDocumentDetails(this.stopId).subscribe(async (resp: any) => {
      this.utilService.dismissLoading();
      const docData = resp.map((item, index) => {
        const data = Object.assign({}, item);
        data.updateQty = item.QTY_0;
        return data;
      })
      this.documentDetails = docData;
      const routeId = localStorage.getItem('activeRouteId');
      this.routesData = await this.utilService.getStorageData('routes').then(data => {
        return _.find(data, { XDRN_0: routeId });
      });
    }, (err: any) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    })
  }

  goToDetail() {
    this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details/job-card-detail']);
  }

  goTo(item) {
    let isNavigate = false;

    this.installBaseList.map(x => {
      x.service.map(y => {
        if (y.XFLAG_0 == 2) {
          isNavigate = true;
        }
      })
    })
    if (isNavigate) {
    } else {
      localStorage.setItem('installBase', JSON.stringify(item));
      this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details/add-product'], { queryParams: { stop: item.RequestNumber, Id: item.InstallBase } });
    }
  }

  goToJobAdd(id, des, code, dec) {
    this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details/job-card-add'], { queryParams: { stop: this.stopId, des: des, Id: id, code: code, dec: dec } });
  }

  goToCaptureDetail() {
    this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details/customer-survey'], { queryParams: { stopId: this.stopId } });
  }

  async addNote() {
    const modal = await this.modalController.create({
      component: AddNotesPage,
      componentProps: { 'notePageData': this.notePageData?.data }
    });
    await modal.present();
    this.notePageData = await modal.onDidDismiss();
    if (this.notePageData && this.notePageData.data) {
      this.note = this.notePageData.data;
      const storedReport = await this.utilService.getStorageData('report');
      storedReport[this.stopId].O_XNOTES = this.note;
      await this.utilService.setStorageData('report', storedReport);
    }
  }

  async addSignature() {
    const modal = await this.modalController.create({
      component: AddSignaturePage,
      componentProps: { 'signPageData': this.signPageData }
    });
    await modal.present();
    const data = await modal.onDidDismiss();
    if (data && data.data) {
      this.signPageData = data.data;
      const storedReport = await this.utilService.getStorageData('report');
      storedReport[this.stopId].O_XSIGNAME = this.signPageData.name;
      storedReport[this.stopId].O_XSIGNATURE = this.signPageData.signature.replace('data:image/png;base64,', '');
      await this.utilService.setStorageData('report', storedReport);
    }
  }

  // captureImage() {
  //   if (this.imgArray.length < 4) {
  //     this.utilService.showImageActionSheet('', async result => {
  //       if (result) {
  //         if (result === CameraSource.Camera) {
  //           this.utilService.pickCamera(result, async imageData => {
  //             this.imgArray.push(imageData);
  //           });
  //         } else {
  //           const inputId = document.getElementById('cameraInput');
  //           inputId.click();
  //         }
  //       }
  //     })
  //   } else {
  //     this.translateService.get(['COMMON.MAX_ALLOWED_PIC']).subscribe((languageRes: any) => {
  //       this.utilService.showToast(languageRes['COMMON.MAX_ALLOWED_PIC']);
  //     });
  //   }
  // }

  captureImage(index: number) {
    this.utilService.showImageActionSheet('', async result => {
      if (result) {
        this.utilService.pickCamera(result, async imageData => {
          this.imgArray[index].image = imageData;
          this.imageUploadIndex = this.imgArray.findIndex(item => item.image === '');
          if (this.imageUploadIndex === -1) {
            console.log('All images are uploaded');
          }
        });
      }
    });
  }

  areAllImagesUploaded(): boolean {
    return this.imgArray.every(item => item.image !== '');
  }

  async onFileChange(event) {
    const files = Array.from(event.target.files);
    if (this.imgArray.length + files.length <= 4) {
      try {
        const promises = files.map(async (file: any) => {
          let fileType = file.type;
          if (!fileType) {
            const fileName = file.name.toLowerCase();
            if (fileName.endsWith('.heif') || fileName.endsWith('.heic')) {
              fileType = 'image/heic';
            }
          }
          if (fileType === 'image/heif' || fileType === 'image/heic') {
            const jpegBase64 = await this.convertHeifToJpeg(file);
            return await this.resizeImage(jpegBase64, 2, 1.5);
          } else {
            return await this.resizeImage(file, 2, 1.5);
          }
        });
        const imagesData = await Promise.all(promises);
        const imageArray = imagesData.map((base64: any) => base64.split(',')[1]);
        this.imgArray.push(...imageArray);
      } catch (error) {
        this.utilService.showToastError('Some images could not be processed.');
      }
    } else {
      this.utilService.showToastError('Maximum 4 images allowed');
    }

    (event.target as HTMLInputElement).value = '';
  }


  convertHeifToJpeg(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.8
      })
        .then((result: Blob | Blob[]) => {
          const jpegBlob = Array.isArray(result) ? result[0] : result;
          const jpegFile = new File([jpegBlob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: 'image/jpeg' });
          resolve(jpegFile);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  resizeImage(file, maxSizeMB, targetSizeMB): Promise<string> {
    return new Promise((resolve, reject) => {
      const img: any = new Image();
      const reader = new FileReader();

      reader.onload = function (e) {
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);

      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > 1024) {
            height *= 1024 / width;
            width = 1024;
          }
        } else {
          if (height > 1024) {
            width *= 1024 / height;
            height = 1024;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        let base64Data = canvas.toDataURL(file.type);

        let sizeInMB = (base64Data.length * (3 / 4)) / (1024 * 1024);

        if (sizeInMB > maxSizeMB) {
          let quality = targetSizeMB / sizeInMB;

          base64Data = canvas.toDataURL(file.type, quality);
        }

        localStorage.setItem('converted', base64Data);
        resolve(base64Data);
      };

      img.onerror = function (error) {
        reject(error);
      };
    });
  }

  removeImage(index) {
    this.imgArray[index].image = '';
    this.imageUploadIndex = index;
  }

  serviceCreation() {
    const routeId = localStorage.getItem('activeRouteId');
    this.translateService.get(['COMMON.CONFIRMATION', 'COMMON.CONFIRM_DETAIL']).subscribe((languageRes: any) => {
      this.utilService.showConfirmationPopup(languageRes['COMMON.CONFIRMATION'], languageRes['COMMON.CONFIRM_DETAIL'], cb => {
        if (cb == 1) {
          let value = `<![CDATA[<PARAM> <FLD NAME="I_XSRENUM" TYPE="Char">${this.stopId}</FLD> <FLD NAME="I_XFLAG" TYPE="Integer">1</FLD> <FLD NAME="I_XROUTNUM" TYPE="Char">${routeId}</FLD></PARAM>]]>\n`;
          this.serviceRequest(value);
        }
      });
    });
  }

  serviceRequest(value) {
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
            $value: 'X1CCREITN'
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
            if (result[1].$value == 2) {
              this.I_XSDHNUM = result[0].$value;
              if (this.I_XSDHNUM) {
                this.confirm();
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
    } else {
      this.utilService.storeApiServiceRequest('X1CCREITN', value, 'soap', '', this.stopId);
      setTimeout(() => {
        this.confirm();
      }, 500)
    }
  }

  async beforeConfirmButtonServiceCall() {
    const value = '<![CDATA[<PARAM> <FLD NAME="I_XSRSPNUM" TYPE="Char">' + this.I_XSDHNUM + '</FLD> </PARAM>]]>';
    const routeId = localStorage.getItem('activeRouteId');
    const params = {
      ServiceRequest: this.stopId,
      routeId: routeId,
      dateTime: moment().format('YYYY-MM-DD hh:mm')
    };
    if (this.utilService.isOnline) {
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
            $value: 'X10CDELECR'
          },
          inputXml: {
            attributes: {
              'xsi:type': "xsd:string"
            },
            $xml: value
          }
        }).subscribe((res: ISoapMethodResponse) => {
          if (res.result.runReturn.resultXml?.$value) {
            const result = res.result.runReturn.resultXml.$value.RESULT.GRP.FLD;
            if (result) {
              this.routeService.updateServiceDateTime(params).subscribe(res => {
                this.utilService.dismissLoading();
                // this.router.navigate(['/tabs/stop-list/stop-detail/pod'], { queryParams: { poddet: this.stopId } });
                this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details/preview'], { queryParams: { poddet: this.stopId, serviceResponse: this.I_XSDHNUM } });
              })
            }
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
      setTimeout(async () => {
        await this.utilService.storeApiServiceRequest('X10CDELECR', value, 'soap', '', this.stopId);
        const stops = (await this.utilService.getStorageData('stops'));
        const currentStopIndex = stops[routeId].findIndex(d => d.XDOCNUM_0 == this.stopId);
        stops[routeId][currentStopIndex].XFINTIME_0 = moment().format('YYYY-MM-DD HH:mm');
        await this.utilService.setStorageData('stops', stops);
        this.routeService.updateServiceDateTime(params).subscribe(res => {
          // this.router.navigate(['/tabs/stop-list/stop-detail/pod'], { queryParams: { poddet: this.stopId } });
          this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details/preview'], { queryParams: { poddet: this.stopId, serviceResponse: '' } });
        });
      }, 1000);
    }
  }

  confirm() {
    // this.translateService.get(['COMMON.CONFIRMATION', 'COMMON.CONFIRM_DETAIL']).subscribe((languageRes: any) => {
    //   this.utilService.showConfirmationPopup(languageRes['COMMON.CONFIRMATION'], languageRes['COMMON.CONFIRM_DETAIL'], cb => {
    // if (cb == 1) {
    if (this.documentDetails.length > 0 && this.documentDetails[0].XDOCTYP_0 == 4) {
      this.pickTicketDeliverValidation();
    } else if (this.documentDetails.length > 0 && this.documentDetails[0].XDOCTYP_0 == 3) {
      this.receiptCreation();
    } else {
      this.captureConfirm();
    }
    // }
    //   });
    // });
  }

  async editQty(item) {
    const modal = await this.modalController.create({
      component: EditQtyPage,
      componentProps: { 'signPageData': item, 'callcontent': callcontent, 'routesData': this.routesData, 'documentDetails': this.documentDetails }
    });

    await modal.present();

    const data = await modal.onDidDismiss();
    if (data && data.data) {
      item.updateQty = data.data.qty;
    }
  }

  removePartService(item, installBase?, type?) {
    const routeId = localStorage.getItem('activeRouteId');
    this.translateService.get(['COMMON.DELETE_PRODUCT', 'COMMON.DELETE_PRODUCT_CONFIRMATION', 'COMMON.DELETE_SUCCESS']).subscribe((res: any) => {
      this.utilService.showConfirmationPopup(res['COMMON.DELETE_PRODUCT'], res['COMMON.DELETE_PRODUCT_CONFIRMATION'], async cb => {
        if (cb == 1) {
          const params = {
            Product: item.Product,
            routeId: routeId,
            USED_QTY_0: item.Quantity ? item.Quantity : item.QTY_0
          }
            this.routeService.updatePartQuantity(params).subscribe(async () => {
          
            const paramsNew = {
              ServiceRequest: this.stopId,
              Product: item.Product,
              routeId: routeId,
              InstallBase: installBase
            };
            setTimeout(() => {
              this.routeService.deleteServiceProduct(paramsNew).subscribe(async () => {
              this.utilService.showToastSucccess('product deleted Successfully');
              if (!this.utilService.isOnline) {
                const installBases = (await this.utilService.getStorageData('installBase'));
                installBases[this.stopId].map(async (x) => {
                  x[type]?.map((y, i) => {
                    if (x.InstallBase == installBase && y.Product == item.Product) {
                      x[type].splice(i, 1);
                      return x;
                    }
                  })
                })
                await this.utilService.setStorageData('installBase', installBases);
                 const jobDetail:any = (await this.utilService.getStorageData('jobCardDetails'));
                 if(jobDetail){
                   jobDetail.map((x,i)=>{
                     if(x.InstallBase == installBase && x.Product ==  item.Product){
                       jobDetail.splice(i, 1);
                       return jobDetail;
                     }
                   })
                    await this.utilService.setStorageData('jobCardDetails', jobDetail);
                 }
              }
              this.getInstallBase();
            });
            }, 500);
            
          })
        }
      })
    })
  }

  async removeProduct(item, index) {
    this.translateService.get(['COMMON.DELETE_PRODUCT', 'COMMON.DELETE_PRODUCT_CONFIRMATION', 'COMMON.DELETE_SUCCESS']).subscribe((res: any) => {
      this.utilService.showConfirmationPopup(res['COMMON.DELETE_PRODUCT'], res['COMMON.DELETE_PRODUCT_CONFIRMATION'], async cb => {
        if (cb == 1) {
          await this.utilService.showLoading();
          this.soap.createClient(environment.soap + '/soap-wsdl/syracuse/collaboration/syracuse/CAdxWebServiceXmlCC?wsdl', {
            attributesKey: 'attributes', valueKey: '$value', xmlKey: '$xml'
          }).then(client => {
            client.setSecurity(new security.BasicAuthSecurity(environment.soapUsername, environment.soapPassword, ''))
            client.call('deleteLines', {
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
                  "soapenc:arrayType": "wss:CAdxParamKeyValue[]"
                },
                key: {
                  $value: 'SDHNUM',
                },
                value: {
                  $value: `${item.XDOCNUM_0}`
                }
              },
              blocKey: {
                attributes: {
                  "xsi:type": "xsd:string"
                },
                $value: 'SDH1~NBLIG'
              },
              lineKeys: {
                attributes: {
                  "xsi:type": "wss:ArrayOf_xsd_string",
                  "soapenc:arrayType": "xsd:string[]"
                },
                value: {
                  $value: index + 1
                }
              },
              inputXml: {
                attributes: {
                  'xsi:type': "xsd:string"
                },
                // $xml: value
              }
            }).subscribe((res: ISoapMethodResponse) => {
              this.utilService.dismissLoading();
              this.documentDetails.splice(index, 1);
              this.utilService.showToastSucccess('COMMON.DELETE_SUCCESS');
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

  async captureConfirm() {
    // await this.utilService.showLoading();
    // const activatedRoute = await this.utilService.getStorageData('stopId');
    // const activateProduct = await this.utilService.getStorageData('documentdet').then(data => {
    //   const id = _.filter(data, { XDOCNUM_0: activatedRoute })
    //   return id;
    // });
    const documentData = (await this.utilService.getStorageData('documentInfo'))[this.stopId];

    // <FLD NAME='I_XSDHNUM'>${documentData[0].XDOCNUM_0}</FLD>
    let value = `
    <![CDATA[<PARAM>
      <GRP ID="GRP1">
       <FLD NAME='I_XSDHNUM'>${this.I_XSDHNUM}</FLD>
       <FLD NAME='I_XPODREF'>${documentData?.XPODREF_0}</FLD>
       <FLD NAME='I_XLOCLAT'>${UtilService.currentPos.lat}</FLD>
       <FLD NAME='I_XLOCLOG'>${UtilService.currentPos.lng}</FLD>
       <FLD NAME='I_XNOTE'>${this.note}</FLD>
       <FLD NAME='I_XSIGNAME'>${this.signPageData.name}</FLD>
       <FLD NAME='I_XSIG'>${this.signPageData.signature.split(',')[1]}</FLD>
       <FLD NAME='I_XMACADD'>4A:21:56:97</FLD>
       <FLD NAME='I_XDEVICEID'>4A:21:56:97</FLD>
       <FLD NAME='I_XBPRATING'>${this.signPageData.rating}</FLD>
       <FLD NAME="I_XHOURS">${this.signPageData.hours}</FLD>
       <FLD NAME="I_XMINUTES">${this.signPageData.minutes}</FLD>
      </GRP>
      <TAB DIM="99" ID="GRP2" SIZE="${this.documentDetails.length}">`;

    if (this.documentDetails.length > 0) {
      this.documentDetails.forEach((prd, index) => {
        value += `
       <LIN NUM="${index + 1}">
        <FLD NAME='I_XSDDLIN'>${(index + 1) * 1000}</FLD>
        <FLD NAME='I_XITMREF'>${prd.ITMREF_0 ? prd.ITMREF_0 : ''}</FLD>
        <FLD NAME='I_XDLVQTY'>${prd.updateQty ? prd.updateQty : ''}</FLD>
        <FLD NAME='I_XPODQTY'>${prd.updateQty ? prd.updateQty : ''}</FLD>
       </LIN>`;
      });
      value += `
      </TAB>
      <TAB DIM="6" ID="GRP3" SIZE="${this.imgArray.length}">`;
    }
    if (this.imgArray.length > 0) {
      this.imgArray.forEach((item, index) => {
        value += `\n\t<LIN NUM="${index + 1}">
         <FLD NAME='I_XIMG'>${item.image}</FLD>
       </LIN>`;
      });
    }
    value += `
      </TAB></PARAM>]]>\n`;
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
            $value: 'X10AVALRES'
          },
          inputXml: {
            attributes: {
              'xsi:type': "xsd:string"
            },
            $xml: value
          }
        }).subscribe((res: ISoapMethodResponse) => {

          if (res.result.runReturn.resultXml?.$value) {
            const result = res.result.runReturn.resultXml.$value.RESULT.GRP[1].FLD;
            if (Number(result[0].$value) == 2) {
              this.beforeConfirmButtonServiceCall();
              this.utilService.showToastSucccess(result[1].$value);
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
    } else {
      this.utilService.storeApiServiceRequest('X10AVALRES', value, 'soap', '', this.stopId);
      setTimeout(() => {
        this.beforeConfirmButtonServiceCall();
      }, 1500);
    }
  }

  pickTicketDeliverValidation(SDHNUM_0 = null) {
    this.translateService.get(['STOP.INCIDENT', 'STOP.INCIDENT_SUBMIT_CONFIRMATION', 'STOP.INCIDENT_SENT_SUCCESSFULLY']).subscribe(async (languageRes: any) => {
      // await this.utilService.showLoading();
      let value = `
    <![CDATA[<PARAM>
      <GRP ID="GRP1">
       <FLD NAME='I_XSDHNUM'>${this.stopId}</FLD>
       <FLD NAME='I_XPODREF'>${this.documentDetails[0].XPODREF_0}</FLD>
       <FLD NAME='I_XLOCLAT'>${UtilService.currentPos.lat}</FLD>
       <FLD NAME='I_XLOCLOG'>${UtilService.currentPos.lng}</FLD>
       <FLD NAME='I_XNOTE'>${this.note}</FLD>
       <FLD NAME='I_XSIGNAME'>${this.signPageData.name}</FLD>
       <FLD NAME='I_XSIG'>${this.signPageData.signature.split(',')[1]}</FLD>
       <FLD NAME='I_XMACADD'>4A:21:56:97</FLD>
       <FLD NAME='I_XDEVICEID'>4A:21:56:97</FLD>
      </GRP>
      <TAB DIM="6" ID="GRP2" SIZE="1">`;

      if (this.documentDetails?.length > 0) {
        this.documentDetails.forEach((prd, index) => {
          value += `
       <LIN NUM="${index + 1}">
        <FLD NAME='I_XSDDLIN'>${(index + 1) * 1000}</FLD>
        <FLD NAME='I_XITMREF'>${prd.ITMREF_0}</FLD>
        <FLD NAME='I_XDLVQTY'>${prd.updateQty}</FLD>
        <FLD NAME='I_XPODQTY'>${prd.updateQty}</FLD>
       </LIN>`;
        });
        value += `
      </TAB>
      <TAB DIM="6" ID="GRP3" SIZE="${this.imgArray.length}">`;
      }
      if (this.imgArray.length > 0) {
        this.imgArray.forEach((item, index) => {
          value += `\n\t<LIN NUM="${index + 1}">
         <FLD NAME='I_XIMG'>${item.image}</FLD>
       </LIN>`;
        });
      }
      value += `
      </TAB></PARAM>]]>\n`;
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
              $value: 'X10AVALPRH'
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
                this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details/preview'], { queryParams: { poddet: this.stopId, serviceResponse: this.I_XSDHNUM } });
                // this.router.navigate(['/tabs/stop-list/stop-detail/pod'], { queryParams: { poddet: this.stopId } });
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
      } else {
        // this.utilService.storeApiIntoPending(environment.soap + '/soap-wsdl/syracuse/collaboration/syracuse/CAdxWebServiceXmlCC?wsdl', value, 'run');
        this.utilService.storeApiIntoPending('X10AVALPRH', value, 'soap', '', this.stopId);
        // this.router.navigate(['/tabs/stop-list/stop-detail/pod'], { queryParams: { poddet: this.stopId } });
        this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details/preview'], { queryParams: { poddet: this.stopId, serviceResponse: '' } });
      }
    });
  }

  async receiptCreation() {
    // await this.utilService.showLoading();
    const documentData = await this.utilService.getStorageData('documentinfo').then(data => {
      const id = _.filter(data, { XDOCNUM_0: this.stopId })
      return id;
    });
    let value = `
    <![CDATA[<PARAM>
      <GRP ID="GRP1">
       <FLD NAME='I_XPTHNUM'>${documentData[0].XDOCNUM_0}</FLD>
       <FLD NAME='I_XPODREF'>${documentData[0].XPODREF_0}</FLD>
       <FLD NAME='I_XLOCLAT'>${UtilService.currentPos.lat}</FLD>
       <FLD NAME='I_XLOCLOG'>${UtilService.currentPos.lng}</FLD>
       <FLD NAME='I_XNOTE'>${this.note}</FLD>
       <FLD NAME='I_XSIGNAME'>${this.signPageData.name}</FLD>
       <FLD NAME='I_XSIG'>${this.signPageData.signature.split(',')[1]}</FLD>
       <FLD NAME='I_XMACADD'>81252721502</FLD>
       <FLD NAME='I_XDEVICEID'>81252721502</FLD>
       <FLD NAME='I_XBPRATING'>${this.signPageData.rating}</FLD>
      </GRP>
      <TAB DIM="99" ID="GRP2" SIZE="${this.documentDetails.length}">`;

    if (this.documentDetails?.length > 0) {
      this.documentDetails.forEach((prd, index) => {
        value += `
       <LIN NUM="${index + 1}">
        <FLD NAME='I_XLINNUM'>${(index + 1) * 1000}</FLD>
        <FLD NAME='I_XITMREF'>${prd.ITMREF_0}</FLD>
        <FLD NAME='I_XQTYUOM'>${prd.updateQty}</FLD>
        <FLD NAME='I_XSTA'>A</FLD>
       </LIN>`;
      });
      value += `
      </TAB>
      <TAB DIM="6" ID="GRP4" SIZE="${this.imgArray.length}">`;
    }
    if (this.imgArray.length > 0) {
      this.imgArray.forEach((item, index) => {
        value += `\n\t<LIN NUM="${index + 1}">
         <FLD NAME='I_XIMAGE'>${item.image}</FLD>
       </LIN>`;
      });
    }
    value += `
      </TAB></PARAM>]]>\n`;
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
            $value: 'X10ARCPT'
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
            if (result[1].$value == 2) {
              this.utilService.showToastSucccess(result[2].$value);
              // this.router.navigate(['/tabs/stop-list/stop-detail/pod'], { queryParams: { poddet: this.stopId } });
              this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details/preview'], { queryParams: { poddet: this.I_XSDHNUM } });
            } else {
              this.utilService.showToast(result[2].$value);
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
      this.utilService.storeApiIntoPending('X10ARCPT', value, 'soap', '', this.stopId);
      this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details/preview'], { queryParams: { poddet: this.stopId, serviceResponse: '' } });
      // this.router.navigate(['/tabs/stop-list/stop-detail/pod'], { queryParams: { poddet: this.stopId } });
    }
  }

  async litigationIssue() {
    const modal = await this.modalController.create({
      component: LitigationPage,
      componentProps: { documentDetails: this.documentDetails, stopId: this.stopId }
    });

    await modal.present();

    const data = await modal.onDidDismiss();
    if (data && data.data) {
    }
  }

  async lotEntry(item) {
    const modal = await this.modalController.create({
      component: LotEntryPage,
      componentProps: {
        productDetail: item
      }
    });

    await modal.present();

    const data = await modal.onDidDismiss();
    if (data && data.data) {
    }
  }

  onClick() {
    localStorage.removeItem('departureTime');
    this.router.navigate(['/tabs/stop-list/stop-detail/pod'], { queryParams: { poddet: this.stopId } });
  }

  goToHome() {
    this.router.navigate(['tabs/routes']);
  }
  // goToJobDetail(installBaseId, productCode) {
  //   this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details/job-card-detail'], { queryParams: { stop: this.stopId, Id: installBaseId, code: productCode } });
  // }
}

