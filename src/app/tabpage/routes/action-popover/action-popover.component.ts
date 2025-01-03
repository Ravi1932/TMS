import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-action-popover',
  templateUrl: './action-popover.component.html',
  styleUrls: ['./action-popover.component.scss'],
})
export class ActionPopoverComponent implements OnInit {

  constructor(
    private router: Router,
    private popoverController: PopoverController,
    private translateService: TranslateService,
    private utilService: UtilService,
    private authService: AuthService
  ) { }

  ngOnInit() { }

  openHistory() {
    this.router.navigate(['/history']);
    this.popoverController.dismiss();
  }

  logout() {
    this.translateService.get(['COMMON.LOGOUT', 'COMMON.LOGOUT_CONFIRMATION'])
      .subscribe(async languageRes => {
        this.utilService.showConfirmationPopup(languageRes['COMMON.LOGOUT'], languageRes['COMMON.LOGOUT_CONFIRMATION'], cb => {
          if (cb == 1) {
            this.authService.logout();
            this.popoverController.dismiss();
          }
        });
      });
  }
}
