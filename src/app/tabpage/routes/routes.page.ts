import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutesService } from 'src/app/services/routes.service';
import { UtilService } from 'src/app/services/util.service';
import * as _ from 'lodash';
import { Events } from 'src/app/services/events';
import { AuthService } from 'src/app/services/auth.service';
import { IonRefresher, PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ActionPopoverComponent } from '../routes/action-popover/action-popover.component';

@Component({
  selector: 'app-routes',
  templateUrl: './routes.page.html',
  styleUrls: ['./routes.page.scss'],
})
export class RoutesPage implements OnInit {
  @ViewChild(IonRefresher) pullToRefresh: IonRefresher;
  routes = [];
  stopsData: any;
  code: any;
  podRep;
  userDetail;
  statusList;
  loginObservable;
  constructor(
    private utilService: UtilService,
    private routesService: RoutesService,
    private route: ActivatedRoute,
    private router: Router,
    public events: Events,
    private authService: AuthService,
    public translateService: TranslateService,
    private popoverController: PopoverController
  ) {
    this.route.queryParams.subscribe(params => {
      const driverId = localStorage.getItem('podDriverId');
      if (params && params.code) {
        if (params.code == driverId) {
          this.utilService.setStorageData('driverCode', params.code);
          this.code = params.code;
          this.getRoutes();
        } else {
          this.authService.logout();
        }
      } else {
        this.code = driverId;
        this.getRoutes();
      }
    });
  }

  ngOnInit() {
    this.loginObservable = this.utilService.isLoginModal.subscribe(res => {
      if (res) {
        this.presentModal();
      }
    })
  }
  async presentModal() {
    this.translateService.get(['COMMON.SYNC_DATA', 'COMMON.SYNC_CONFIRMATION'])
      .subscribe(async languageRes => {
        this.utilService.showConfirmation(languageRes['COMMON.SYNC_DATA'], languageRes['COMMON.SYNC_CONFIRMATION'], cb => {
          if (cb == 1) {
            this.loginObservable.unsubscribe();
            this.router.navigate(['tabs/layout/sync-data']);
          } else {
            this.loginObservable.unsubscribe();
          }
        });
      });
  }
  ionViewWillEnter() {
    this.utilService.isLogin.subscribe(res => {
      this.userDetail = res;
    })
    this.userDetail = JSON.parse(localStorage.getItem('userDetail'));
    if (this.userDetail) {
      this.getStatus();
    }
  }
  getStatus() {
    if (this.utilService.isOnline) {
      this.routesService.getUserStatus(this.userDetail[0].XUSER_0).subscribe(res => {
        if (res) {
          this.statusList = res;
        }
      })
    } else {
      this.utilService.storeApiIntoPending(`/userStatus/${this.userDetail[0].XUSER_0}`, '', 'get');
    }
  }

  async presentPopover(ev) {
    const popover = await this.popoverController.create({
      component: ActionPopoverComponent,
      event: ev,
      translucent: false
    });
    await popover.present();
  }

  async getRoutes() {
    await this.utilService.showLoading();
    const params = {
      driverId: this.code,
      type: 1
    }
    this.routesService.getRoutes(params).subscribe((res: any) => {
      this.completeWidgets();
      if (res) {
        this.routes = res;
        this.routes.sort((a, b) => {
          const dateA = new Date(a.XDLVDAT_0);
          const dateB = new Date(b.XDLVDAT_0);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateB.getTime() - dateA.getTime();
          } else {
            return b.XTRIP_0 - a.XTRIP_0;
          }
        });
        // // Sort the array based on the desired order
        // this.routes.sort((a, b) => {
        //   // Get the index of XROUTSTAT_0 in the desiredOrder array
        //   const indexA = desiredOrder.indexOf(a.XROUTSTAT_0);
        //   const indexB = desiredOrder.indexOf(b.XROUTSTAT_0);

        //   // Compare the indexes
        //   return indexA - indexB;
        // });
        // // this.routes.sort((a, b) => {
        // //   const dateA = new Date(a.XDLVDAT_0);
        // //   const dateB = new Date(b.XDLVDAT_0);
        // //   if (dateA.getTime() !== dateB.getTime()) {
        // //     return dateB.getTime() - dateA.getTime();
        // //   } else {
        // //     return b.XTRIP_0 - a.XTRIP_0;
        // //   }
        // // });
        localStorage.removeItem('activeRouteId');
        this.events.publish('routeId:change', null);
      }
    }, (err: any) => {
      this.completeWidgets();
      this.utilService.showErrorCall(err);
    });
  }

  onStart(route, index) {
    localStorage.setItem('activeRouteId', route.XDRN_0);
    this.events.publish('routeId:change', route.XDRN_0);
    this.router.navigate(['/tabs/stop-list'], { queryParams: { route: route.XDRN_0 } });
  }

  logout() {
    this.translateService.get(['COMMON.LOGOUT', 'COMMON.LOGOUT_CONFIRMATION'])
      .subscribe(async languageRes => {
        this.utilService.showConfirmationPopup(languageRes['COMMON.LOGOUT'], languageRes['COMMON.LOGOUT_CONFIRMATION'], cb => {
          if (cb == 1) {
            this.authService.logout();
          }
        });
      });
    // this.utilService.showConfirmationPopup('Logout', 'Are you sure you want to logout?', cb => {
    //   if (cb == 1) {
    //     this.authService.logout();
    //   }
    // });
  }

  doRefresh(event) {
    this.getRoutes();
  }

  completeWidgets() {
    this.utilService.dismissLoading();
    if (this.pullToRefresh) {
      this.pullToRefresh.complete()
    }
  }
}
