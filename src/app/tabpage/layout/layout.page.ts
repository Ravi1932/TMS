import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { ActionPopoverComponent } from '../routes/action-popover/action-popover.component';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import { RoutesService } from 'src/app/services/routes.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-layout',
  templateUrl: './layout.page.html',
  styleUrls: ['./layout.page.scss'],
})
export class LayoutPage implements OnInit {
  driverId;
  userDetail;
  statusList;
  loginObservable;
  constructor(
    private popoverController: PopoverController,
    private router: Router,
    private utilService: UtilService,
    private routesService: RoutesService,
    private translateService: TranslateService
  ) {
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

  goTo(url): void {
    this.router.navigate([url]);
  }
}
