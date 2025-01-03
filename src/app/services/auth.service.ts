import { Injectable } from '@angular/core';
import { UtilService } from './util.service';
import { CommonService } from './common.service';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import * as _ from 'lodash';
import { Events } from './events';
import { TranslateService } from '@ngx-translate/core';
import { AllApiService } from './all-api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isCallingApi: boolean;
  pendingAPIInterval;
  constructor(
    public router: Router,
    public storage: Storage,
    public utilService: UtilService,
    public events: Events,
    private translateService: TranslateService,
    public commonService: CommonService,
  ) {
  }

  public login(data) {
    this.translateService.get(['COMMON.VERIFYING_LOGIN', 'COMMON.LOGIN_DONE', 'COMMON.INVALID_LOGIN']).subscribe((languageRes: any) => {
      this.utilService.showLoading(languageRes['COMMON.VERIFYING_LOGIN']).then(res => {
        this.commonService.post('/VerifyLogin', data).subscribe(async (res: any) => {
          this.utilService.dismissLoading();
          if (res.status == 0) {
            this.utilService.showToastError(res.message);
          } else if (res.status == 2) {
            this.utilService.showToast(res.message)
          } else if (res && res.status == 1) {
            localStorage.setItem('userDetail', JSON.stringify(res.data));
            let loginUser = await this.storage.get('user');
            if (loginUser !== res.data[0].XUSER_0) {
              this.storage.clear();
            }
            this.utilService.isLogin.next(res.data);
            this.storeAndProceed(res.data[0].XUSER_0, true, '/tabs/routes');
            this.utilService.showToastSucccess(languageRes['COMMON.LOGIN_DONE']);
          }
        }, error => {
          this.utilService.dismissLoading();
          if (error.error && error.error.message === 'Unauthorised') {
            this.utilService.showToast(languageRes['COMMON.INVALID_LOGIN']);
          } else {
            this.utilService.showErrorCall(error);
          }
        });
      });
    });
    // }
  }

  public storeAndProceed(data, noNeedDashView = false, path = '') {
    this.utilService.setStorageData('user', data).then(res => {
      if (noNeedDashView) {
        this.events.publish("user:login", true);
        this.router.navigate([path], { replaceUrl: false });
      } else {
        this.gotoDashBoard(data);
      }
    });
    localStorage.setItem('podDriverId', data);
    this.utilService.isLoginModal.next(true);
  }

  public gotoDashBoard(data) {
    this.router.navigate(['/tabs/routes'], { queryParams: { code: data } });
    this.events.publish("user:login", true);
    // window.dispatchEvent(new CustomEvent('user:login'));
  }

  public async logout() {
    if (this.utilService.isOnline) {
      let pendingApiList = await this.storage.get('pendingApiList');
      let pendingApiListLineNumber = await this.storage.get('pendingApiListLineNumber');
      if (!pendingApiList && !pendingApiListLineNumber) {
        this.logoutAPICallingAndLogout();
      } else {
        this.pendingAPIInterval = setInterval(async () => {
          let pendingApiList = await this.storage.get('pendingApiList');
          let pendingApiListLineNumber = await this.storage.get('pendingApiListLineNumber');
          if (!pendingApiList && !pendingApiListLineNumber) {
            setTimeout(() => {
              this.logoutAPICallingAndLogout();
            }, 2000);
            clearInterval(this.pendingAPIInterval);
          }
        }, 1000);
      }
    } else {
      this.utilService.showToastError('Please check your internet');
    }
  }

  logoutAPICallingAndLogout() {
    this.utilService.showLoading();
    const driverID = localStorage.getItem('podDriverId');
    const params = {
      driverId: driverID
    }
    this.commonService.post('/VerifyLogout', params).subscribe((res) => {
      if (res.status == 1) {
        this.utilService.dismissLoading();
        let lang = localStorage.getItem('language');
        localStorage.clear();
        localStorage.setItem('language', lang);
        this.router.navigateByUrl('/login');
        this.events.publish("user:logout", true);
        this.utilService.showToastSucccess('Logged out Successfully');
      }
    }, (err) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    });
  }

}
