import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutesService } from 'src/app/services/routes.service';
import * as moment from 'moment';
import { UtilService } from 'src/app/services/util.service';
import { findIndex } from 'lodash';

import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-job-card-detail',
  templateUrl: './job-card-detail.page.html',
  styleUrls: ['./job-card-detail.page.scss'],
})
export class JobCardDetailPage implements OnInit {
  private startTime: Date | null = null;
  private pausedTime: number | null = null;
  private timerInterval: any;
  formattedTime: string = '00:00:00';
  isRunning: boolean = false;
  isPaused: boolean = false;
  stopId;
  installBaseId;
  productCode;
  start;
  pause;
  resume;
  end;
  jobDetailList;
  jobTime;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private routeService: RoutesService,
    private utilService: UtilService) {
    this.route.queryParams.subscribe(params => {
      this.stopId = params.stop;
      this.installBaseId = params.Id;
      this.productCode = params.code;
    })

  }

  ngOnInit() {
    // this.getJobCardDetail();
  }
  goTo() {
    this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details'], { queryParams: { podId: this.stopId } });
  }
}
