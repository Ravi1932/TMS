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
  status;
  currentStop = [];
  stopId;
  isActiveStop;
  cus_name;
  cus_code;

  constructor(
    private router: Router,
    private popoverController: PopoverController,
    private utilService: UtilService
  ) { }

  ngOnInit() {
  }

  showPreview() {
    if (this.status == 6) {
      this.popoverController.dismiss();
      this.router.navigate(['/tabs/stop-list/stop-detail/pod-report'],
        { queryParams: { podrep: this.stopId } }
      );
    } else {
      this.utilService.showToast('First complete product delivery.')
    }
  }

  skipStop() {
    if (this.isActiveStop) {
      this.utilService.showToast('Complete active stop fisrt.');
    } else {
      this.popoverController.dismiss();
      this.router.navigate(['/tabs/stop-list/skip-stop'],
        { queryParams: { docNo: this.stopId, cus_name: this.cus_name, cus_code: this.cus_code } }
      );
    }
  }

  cancelStop() {
    this.popoverController.dismiss();
    this.router.navigate(['/tabs/stop-list/cancel-stop'],
      { queryParams: { docNo: this.stopId, displayType: "cancelStop", cus_name: this.cus_name, cus_code: this.cus_code } }
    );
  }

  rescheduleStop() {
    this.popoverController.dismiss();
    this.router.navigate(['/tabs/stop-list/cancel-stop'],
      { queryParams: { docNo: this.stopId, displayType: 'rescheduleStop', cus_name: this.cus_name, cus_code: this.cus_code } }
    );
  }
}
