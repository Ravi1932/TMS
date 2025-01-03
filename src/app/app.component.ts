import { Component } from '@angular/core';
import { Network } from '@capacitor/network';
import { UtilService } from './services/util.service';
import { Events } from './services/events';
import { TranslateService } from '@ngx-translate/core';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';
import { NetworkService } from './services/network.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private utilService: UtilService,
    public events: Events,
    public updates: SwUpdate,
    private router: Router,
    private translate: TranslateService,
    private network: NetworkService,
    private navCtrl: NavController,
  ) {
    // interval(6 * 60 * 60).subscribe(() => updates.checkForUpdate().then(() => console.log("checking for updates")));
    updates.available.subscribe(event => {
      updates.activateUpdate().then(() => this.updateApp());
    });

    // if (this.network.type === 'none') {
    //   this.utilService.setOnline(false);
    // } else {
    //   this.utilService.setOnline(true);
    // }
    this.changeLanguage();
    this.listenLanguageChanged();
  }

  updateApp() {
    document.location.reload();
  }

  // reloadLoginPage() {
  //   const isReloaded = localStorage.getItem('isLoginPageReloaded');
  //   if(!isReloaded){
  //     localStorage.setItem('isLoginPageReloaded', 'true');
  //     // window.location.reload();
  //     // window.location.assign(window.location.href);
  //     // window.location.href = window.location.href;
  //     this.navCtrl.navigateRoot('/');
  //   }
  // }


  async ngAfterViewInit() {
    this.checkPermission();
    const networkStatus = await Network.getStatus();
    this.utilService.setOnline(networkStatus.connected);
    Network.addListener('networkStatusChange', (detect) => {
      if (detect.connected) {
        this.events.publish('network:change', true);
        this.translate.get(['COMMON.INTERNET_CONNECTED']).subscribe(languageRes => {
          this.utilService.showToastSucccess(languageRes['COMMON.INTERNET_CONNECTED']);
        });
        this.utilService.setOnline(true);
        this.network.isCallPendingApi();
      } else {
        this.events.publish('network:change', false);
        this.translate.get(['COMMON.INTERNET_DISCONNECTED']).subscribe(languageRes => {
          this.utilService.showToastError(languageRes['COMMON.INTERNET_DISCONNECTED']);
        });
        this.utilService.setOnline(false);
      }
    });
    // setTimeout(() => {
    //   this.reloadLoginPage();
    // }, 2000);
  }

  changeLanguage() {
    this.translate.setDefaultLang('en');
    if (localStorage.getItem('language')) {
      this.translate.use(localStorage.getItem('language'));
    }
  }

  listenLanguageChanged() {
    this.events.subscribe("language:changed", (resp) => {
      this.changeLanguage();
    });
  }

  getLocation() {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };
      navigator.geolocation.getCurrentPosition((position) => {
        if (position && position.coords) {
          UtilService.currentPos = {
            lat: (position.coords.latitude) ? position.coords.latitude : 0,
            lng: (position.coords.longitude) ? position.coords.longitude : 0
          };
        }
      }, err => {
        console.log(err);
      }, options);

      navigator.geolocation.watchPosition((position: any) => {
        if (position && position.coords) {
          UtilService.currentPos = {
            lat: (position.coords.latitude) ? position.coords.latitude : 0,
            lng: (position.coords.longitude) ? position.coords.longitude : 0
          };
        }
      }, err => {
        console.log(err);
      }, options);
    } else {
      console.log('The location is not supported by this browser.');
    }
  }

  checkPermission() {
    navigator.permissions && navigator.permissions.query({ name: 'geolocation' })
      .then((PermissionStatus) => {
        const messages = [
          'COMMON.LOCATION_ALERT',
          'COMMON.START_GPS',
          'COMMON.PERMISSION_DENIED',
        ];
        this.translate.get(messages).subscribe(languageRes => {
          if (PermissionStatus.state == 'granted') {
            this.getLocation();
          } else if (PermissionStatus.state == 'prompt') {
            // prompt - not yet grated or denied
            this.utilService.showConfirmationPopup(languageRes['COMMON.LOCATION_ALERT'],
              languageRes['COMMON.START_GPS'], (cb) => {
                if (cb) {
                  this.getLocation();
                }
              });
          } else {
            //denied
            this.utilService.showAlert(languageRes['COMMON.LOCATION_ALERT'], '', languageRes['COMMON.PERMISSION_DENIED']);
          }
        });
      });
  }
}
