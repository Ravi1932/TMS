import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private translateService: TranslateService,
    private utilService: UtilService,
    private authService: AuthService
  ) { }

  logout() {
    this.translateService.get(['COMMON.LOGOUT', 'COMMON.LOGOUT_CONFIRMATION'])
      .subscribe(async languageRes => {
        this.utilService.showConfirmationPopup(languageRes['COMMON.LOGOUT'], languageRes['COMMON.LOGOUT_CONFIRMATION'], cb => {
          if (cb == 1) {
            this.authService.logout();
          }
        });
      });
  }
}
