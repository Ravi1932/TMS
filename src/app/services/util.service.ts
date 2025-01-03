import { Injectable, NgZone } from '@angular/core';

import { AlertController, ActionSheetController, LoadingController, ToastController } from '@ionic/angular';

import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UtilService {
  public static currentPos = {
    lat: 0,
    lng: 0
  };
  public apiUrl: any = environment.host;
  public pictureUrl: any = '';
  // public fileTransfer: FileTransferObject;
  public loader = null;
  public isOnline = true;
  location: any;
  myImage = null;
  public customerSurvey: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public isLogin: BehaviorSubject<any> = new BehaviorSubject<any>('');
  public isLoginModal: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  constructor(
    public router: Router,
    public alertCtrl: AlertController,
    public actionSheetCtrl: ActionSheetController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    private storage: Storage,
    private ngZone: NgZone,
    private translateService: TranslateService,
    // public transfer: FileTransfer
  ) {
    this.pictureUrl = environment.host + 'uploads/';
    // this.fileTransfer = this.transfer.create();
  }

  setOnline(flag) {
    this.isOnline = flag;
  }

  async storeApiWebservice(endpoint, payload, type, extra = '',searviceRequestNumber = null) {
    const pendingApis = await this.getStorageData('pendingApiWebservice') ?? [];
    pendingApis.push({ endpoint: endpoint, payload: payload, type: type, extra: extra,searviceRequestNumber });
    return this.setStorageData('pendingApiWebservice', pendingApis);
  }

  async storeApiIntoPending(endpoint, payload, type, extra = '',searviceRequestNumber = null) {
    const pendingApis = await this.getStorageData('pendingApiList') ?? [];
    pendingApis.push({ endpoint: endpoint, payload: payload, type: type, extra: extra ,searviceRequestNumber});
    return this.setStorageData('pendingApiList', pendingApis);
  }

  async storeApiServiceRequest(endpoint, payload, type, extra = '',searviceRequestNumber = null) {
    const pendingApis = await this.getStorageData('pendingApiServiceRequest') ?? [];
    pendingApis.push({ endpoint: endpoint, payload: payload, type: type, extra: extra,searviceRequestNumber });
    return this.setStorageData('pendingApiServiceRequest', pendingApis);
  }

  async storeApiIntoPendingForLineNumber(endpoint, payload, type, extra = '',searviceRequestNumber = null) {
    const pendingApis = await this.getStorageData('pendingApiListLineNumber') ?? [];
    pendingApis.push({ endpoint: endpoint, payload: payload, type: type, extra: extra,searviceRequestNumber});
    return this.setStorageData('pendingApiListLineNumber', pendingApis);
  }

  async showToast(message: string = 'COMMON.WENT_WRONG') {
    this.translateService.get(message).subscribe(async res => {
      const toast = await this.toastCtrl.create({
        message: res,
        duration: 3000
      });
      toast.present();
    });
  }

  async showAlert(title, subTitle, message, callback?: any, buttonText = 'COMMON.OK') {
    this.translateService.get(buttonText).subscribe(async res => {
      const alert = await this.alertCtrl.create({
        header: title,
        subHeader: subTitle,
        message,
        backdropDismiss: false,
        buttons: [{
          text: res,
          role: 'cancel',
          handler: (blah) => {
            if (callback) { callback(); }
          }
        }]
      });

      await alert.present();
    });
  }

  async showConfirmationPopup(title, msg, callback, buttonText = ['Yes', 'No']) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: msg,
      buttons: [
        {
          text: buttonText[1],
          role: 'cancel',
          handler: (blah) => {
            callback(0);
          }
        }, {
          text: buttonText[0],
          handler: () => {
            callback(1);
          }
        }
      ]
    });

    await alert.present();
  }

  async showConfirmation(title, msg, callback, buttonText = ['Sync Data', 'Cancel']) {
    const alert = await this.alertCtrl.create({
      header: title,
      message: msg,
      buttons: [
        {
          text: buttonText[1],
          role: 'cancel',
          handler: (blah) => {
            callback(0);
            alert.dismiss();
          }
        },
        {
          text: buttonText[0],
          handler: () => {
            callback(1);
            alert.dismiss();
          }
        }
      ]
    });
    await alert.present();
  }

  async showLoading(message: string = 'Please wait') {
    await this.loadingCtrl.create({
      message,
      animated: true
    }).then(loader => {
      this.loader = loader;
      this.loader.present();
    });
  }
  async showToastSucccess(message: string = "") {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: "success",
    });
    toast.present();
  }
  async showToastError(message: string = "") {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: "danger",
    });
    toast.present();
  }
  async dismissLoading() {
    if (this.loader) {
      this.loader.dismiss();
    }
  }

  async showImageActionSheet(isDocSelection, callback) {
    this.translateService.get(['COMMON.LOAD_FROM_LIBRARY', 'COMMON.TAKE_PHOTO', 'COMMON.SELECT_SOURCES', 'COMMON.CANCEL'])
      .subscribe(async languageRes => {
        const options: any = [
          {
            text: languageRes['COMMON.LOAD_FROM_LIBRARY'],
            handler: () => {
              callback(CameraSource.Photos);
            }
          },
          {
            text: languageRes['COMMON.TAKE_PHOTO'],
            handler: () => {
              callback(CameraSource.Camera);
            }
          },

        ];

        // if (isDocSelection) {
        //   options.push({
        //     text: 'Select Document',
        //     handler: () => {
        //       callback(3);
        //     }
        //   });
        // }

        options.push({
          text: languageRes['COMMON.CANCEL'],
          role: 'cancel'
        });

        const actionSheet = await this.actionSheetCtrl.create({
          header: languageRes['COMMON.SELECT_SOURCES'],
          buttons: options
        });

        await actionSheet.present();
      });
  }

  pickCamera(type, callback) {
    Camera.getPhoto({
      quality: 100,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: type
    })
      .then((ImageData) => {
        callback(ImageData.dataUrl.split(',')[1]);
      })
      .catch((err) => {
      })
      ;
  }

  public showErrorCall(err, showErrToast: boolean = false, errMsg?: string) {
    if (err.status === 401) {
      this.logout();
    }
    if (err.error) {
      try {
        const errBody = err.error;
        errMsg = errBody.message;
        if (typeof errMsg === 'object') {
          let errTypes: any = [];
          Object.keys(errMsg).forEach(key => {
            errTypes = errTypes.concat(errMsg[key]);
          });
          errMsg = errTypes.join(',');
        }
      } catch (error) {
        this.showToast();
      }
    } else {
      this.showToast();
    }

    if (errMsg) {
      this.showToast(errMsg);
    } else {
      this.showToast(errMsg);
    }
  }

  logout() {
    this.translateService.get(['COMMON.ALERT', 'COMMON.SESSION_EXPIRED', 'COMMON.TAP_LOGIN'])
      .subscribe(async languageRes => {
        this.showAlert(languageRes['COMMON.ALERT'], languageRes['COMMON.SESSION_EXPIRED'], languageRes['COMMON.TAP_LOGIN'], () => {
          localStorage.clear();
          this.storage.clear();
          this.router.navigate(['/login'], { replaceUrl: true });
          window.dispatchEvent(new CustomEvent('user:logout'));
        }, 'Login');
      });
  }

  dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    } else { byteString = unescape(dataURI.split(',')[1]); }

    // separate out the mime component
    const mimeString = dataURI
      .split(',')[0]
      .split(':')[1]
      .split(';')[0];

    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
  }

  setStorageData(key, value) {
    return this.storage.set(key, value);
  }

  getStorageData(key) {
    return this.storage.get(key);
  }

  removeStorageData(key) {
    return this.storage.remove(key);
  }

  public formatNumber(value): string {
    if (!value) {
      return '';
    }
    const regex = /[-+*/()=,\s]/g;
    value = value.replace(regex, '');
    const parts = value.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  redirectToBrowser(link) {
    window.open(link, '_system');
  }
}
