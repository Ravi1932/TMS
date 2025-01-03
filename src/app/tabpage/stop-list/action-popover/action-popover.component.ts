import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-action-popover',
  templateUrl: './action-popover.component.html',
  styleUrls: ['./action-popover.component.scss'],
})
export class ActionPopoverComponent implements OnInit {
  constructor(private router: Router,
    private utilService: UtilService,
    private popoverController: PopoverController) { }

  ngOnInit() {
  }

  goTo() {
    // if (!this.utilService.isOnline) {
      // this.utilService.showToast("Spot Service request creation will only work if you are online");
      // this.popoverController.dismiss();
      // return;
    // } else {
      this.router.navigate(['/tabs/layout/scheduled-service-order']);
      this.popoverController.dismiss();
    // }
  }

}
