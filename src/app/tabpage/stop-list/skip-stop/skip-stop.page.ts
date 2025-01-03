import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoutesService } from 'src/app/services/routes.service';
import { UtilService } from 'src/app/services/util.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-skip-stop',
  templateUrl: './skip-stop.page.html',
  styleUrls: ['./skip-stop.page.scss'],
})
export class SkipStopPage implements OnInit {
  submitted = false;
  skipstopModel: any = {
    reason: '',
    comment: '',
  };
  stopId;
  stopsDetails;
  docNo;
  skipReasons;
  cus_name;
  cus_code;

  constructor(
    private utilService: UtilService,
    private routesService: RoutesService,
    private route: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService
  ) {
    this.route.queryParams.subscribe(params => {
      if (params && params.docNo) {
        this.docNo = params.docNo;
        this.cus_name = params.cus_name;
        this.cus_code = params.cus_code;
      }
    });
  }

  async ngOnInit() {
    await this.utilService.showLoading();
    this.routesService.skipReason().subscribe((resp) => {
      this.utilService.dismissLoading();
      if (!this.utilService.isOnline) {
        this.skipReasons = resp;
      } else {
        this.skipReasons = resp;
      }

    }, (err) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    });
  }

  onSubmit(form) {
    this.submitted = true;
    if (form.valid) {
      this.translateService.get(['COMMON.CONFIRMATION', 'COMMON.SKIP_CONFIRMATION']).subscribe((languageRes: any) => {
        this.utilService.showConfirmationPopup(languageRes['COMMON.CONFIRMATION'], languageRes['COMMON.SKIP_CONFIRMATION'], async cb => {
          if (cb == 1) {
            this.skipstopModel.doc = this.docNo;
            this.skipstopModel.latitude = UtilService.currentPos.lat;
            this.skipstopModel.longitude = UtilService.currentPos.lng;
            const datetime = moment().format('YYYY-MM-DDTHH:mm:ss');
            this.skipstopModel.datetime = datetime;
            await this.utilService.showLoading();
            this.routesService.postSkipRoute(this.skipstopModel).subscribe((resp: any) => {
              this.utilService.dismissLoading();
              // this.updateArray();
              let routeId = localStorage.getItem('activeRouteId');
              this.router.navigate(['/tabs/stop-list'], { queryParams: { route: routeId } });
            }, (err: any) => {
              this.utilService.dismissLoading();
              this.utilService.showErrorCall(err);
            });
          }
        }
        );
      });
    }
  }

  // async updateArray() {
  //   let documentinfo = await this.utilService.getStorageData('documentinfo').then(
  //     documentinfo => {
  //       const currentStop = _.filter(documentinfo, { XDOCNUM_0: this.docNo });
  //       currentStop[0].isSkip = true;
  //       return documentinfo
  //     }
  //   );
  //   // console.log(documentinfo);
  //   this.utilService.setStorageData('documentinfo', documentinfo)
  // }
}
