import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutesService } from 'src/app/services/routes.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-reschedule-stop',
  templateUrl: './reschedule-stop.page.html',
  styleUrls: ['./reschedule-stop.page.scss'],
})
export class RescheduleStopPage implements OnInit {
  rescheduleForm: FormGroup;
  rescheduleReson = [];
  reschedstopModel: any = {
    reason: '',
    comment: '',
    date: ''
  };
  submitted = false;
  routeId;
  serviceRequest;
  constructor(
    private routesService: RoutesService,
    private route: ActivatedRoute,
    private router: Router,
    private utilService: UtilService
  ) {
    this.route.queryParams.subscribe(params => {
      this.routeId = params.id;
      this.serviceRequest = params.serviceRequest;
    })
  }

  ngOnInit() {
    this.rescheduleList();
  }

  rescheduleList() {
    this.routesService.getRescheduleList().subscribe(res => {
      if (res) {
        this.rescheduleReson = res;
      } else {
        this.utilService.showToast('Something Wrong!');
      }
    })
  }

  async onReschedule(form) {
    this.submitted = true;
    if (form.valid) {
      const params = {
        routeId: this.routeId,
        reason: this.reschedstopModel.reason,
        comment: this.reschedstopModel.comment,
        date: this.reschedstopModel.date,
        serviceRequest: this.serviceRequest
      }
      if (this.utilService.isOnline) {
        this.routesService.rescheduleReason(params).subscribe(res => {
          if (res) {
            this.router.navigate(['/tabs/stop-list'], { queryParams: { route: this.routeId } });
          } else {
            this.utilService.showToast('Something Wrong!');
          }
        })
      } else {
        this.utilService.storeApiIntoPending('/updateReschedule', params, 'post', '',this.serviceRequest);
        const stops = await this.utilService.getStorageData('stops');
        const currentStopIndex = stops[this.routeId].findIndex(d => d.XDOCNUM_0 == this.serviceRequest);
        stops[this.routeId][currentStopIndex].XSTATUS_0 = 8;
        stops[this.routeId][currentStopIndex].Date = this.reschedstopModel.date
        await this.utilService.setStorageData('stops', stops);
        this.router.navigate(['/tabs/stop-list'], { queryParams: { route: this.routeId } });
      }
    }
  }

  goTo() {
    this.router.navigate(['/tabs/stop-list'], { queryParams: { route: this.routeId } });
  }
}
