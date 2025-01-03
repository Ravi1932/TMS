import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import { environment } from 'src/environments/environment';
import { ISoapMethodResponse, NgxSoapService, security } from 'ngx-soap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { findIndex } from 'lodash';
import { RoutesService } from 'src/app/services/routes.service';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
const callcontent = `
      <codeLang xsi:type="xsd:string">${environment.soapLanguage}</codeLang>
      <poolAlias xsi:type="xsd:string">${environment.soapPoolAlias}</poolAlias>
      <poolId xsi:type="xsd:string">?</poolId>
      <requestConfig xsi:type="xsd:string">?</requestConfig>
`;
@Component({
  selector: 'app-job-card-add',
  templateUrl: './job-card-add.page.html',
  styleUrls: ['./job-card-add.page.scss'],
})
export class JobCardAddPage implements OnInit {
  addJobCardForm: FormGroup;
  stopId;
  productCode;
  installBaseId;
  Technician;
  routeId;
  selectService;
  submitted = false;
  customerDetail;
  timeForm: FormGroup;
  private startTime: Date | null = null;
  private pausedTime: number | null = null;
  private timerInterval: any;
  formattedTime: string = '00:00:00';
  isRunning: boolean = false;
  isPaused: boolean = false;
  start;
  pause;
  resume;
  end;
  jobDetailList;
  jobTime;
  endDate;
  startDate;
  formattedDuration: string = '';
  isConfirm = false;
  description;
  isTimeFieldDisabled = false;
  installDescription;
  showError;
  isBtnDisable :boolean =true;
  constructor(
    private router: Router,
    private utilService: UtilService,
    private soap: NgxSoapService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private translateService: TranslateService,
    private routesService: RoutesService,
    private datePipe: DatePipe
  ) {
    this.addJobCardForm = this.fb.group({
      serviceDetail: ['', [Validators.required]],
      time: ['', [Validators.required]]
    })
    this.timeForm = this.fb.group({
      jobtime: ['']
    });
  }

  get l() {
    return this.addJobCardForm.controls;
  }
  onInputChange(event: any) {
    const inputValue = event.target.value;
    this.showError = inputValue.length > 7;
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.stopId = params.stop;
      this.installBaseId = params.Id;
      this.installDescription = params.des;
      this.productCode = params.code;
      this.description = params.dec;
    });
    this.routeId = localStorage.getItem('activeRouteId');
    this.Technician = JSON.parse(localStorage.getItem('userDetail'));
    this.getCustomer();
    this.getJobCardDetail();

  }

  getCustomer() {
    this.routesService.getCustomerDetail(this.stopId).subscribe(res => {
      this.customerDetail = res;
    })
  }
  formatDuration(durationString: string): string {
    const hours = parseInt(durationString.substring(0, 2), 10);
    const minutes = parseInt(durationString.substring(2, 4), 10);
    const seconds = parseInt(durationString.substring(4), 10);

    const formattedHours = this.padZero(hours);
    const formattedMinutes = this.padZero(minutes);
    const formattedSeconds = this.padZero(seconds);

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  calculateEndTime(startTime: string, duration: string) {
    const startTimeDate = new Date(`2000-01-01 ${startTime}`);
    const durationParts = duration.split(':').map(part => parseInt(part, 10));
    const durationMilliseconds = (durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2]) * 1000;
    const endTimeDate = new Date(startTimeDate.getTime() + durationMilliseconds);
    this.end = this.datePipe.transform(endTimeDate, 'HH:mm:ss') || '';
  }

  async submitForm() {
    if (this.timeForm.value.jobtime.length <= 6) {
      this.formattedDuration = this.formatDuration(this.timeForm.value.jobtime);
      this.calculateEndTime(this.end, this.formattedDuration);
    } else {
      this.formattedDuration = this.timeForm.value.jobtime;
    }
    this.translateService.get(['COMMON.CONFIRMATION', 'COMMON.ADD_DURATION_CONFIRMATION']).subscribe((res: any) => {
      this.utilService.showConfirmationPopup(res['COMMON.CONFIRMATION'], res['COMMON.ADD_DURATION_CONFIRMATION'], async cb => {
        if (cb == 1) {
          this.utilService.showLoading();
          const formValue = this.addJobCardForm.value;
          const JobID = `JOB-${this.Technician[0]?.Name.split(' ')[0]}-${Date.now()}`;
          let value = `
          <![CDATA[<PARAM>
       <FLD NAME="I_XJOBID" TYE="Char">${JobID}</FLD>
      <FLD NAME="I_XSRENUM" TYPE="Char">${this.stopId}</FLD>
      <FLD NAME="I_XBASE" TYPE="Char">${this.installBaseId}</FLD>
      <FLD NAME="I_XTECH" TYPE="Char">${this.Technician[0]?.Name}</FLD>
      <FLD NAME="I_XITMREF" TYPE="Char">${this.productCode}</FLD>
      <FLD NAME="I_XSTRDATE" TYPE="Date">${moment(this.startDate).format('YYYYMMDD')}</FLD>
      <FLD NAME="I_XENDDATE" TYPE="Date">${moment(this.endDate).format('YYYYMMDD')}</FLD>
      <FLD NAME="I_XSTRTIME" TYPE="Char">${this.start}</FLD>
      <FLD NAME="I_XENDTIME" TYPE="Char">${this.end}</FLD>
      <FLD NAME="I_XDURATION" TYPE="Char">${this.formattedDuration}</FLD>
      <FLD NAME="I_XDRN" TYPE="Char">${this.routeId}</FLD>
      <FLD NAME="I_XITNNUM" TYPE="Date"></FLD>
      <FLD NAME="I_XBPCNUM" TYPE="Char">${this.customerDetail.ClientCode}</FLD>
      <FLD NAME="I_XBPCNAM" TYPE="Char">${this.customerDetail.ClinetName}</FLD>
      <FLD NAME="I_XSERDET" TYPE="Char">${formValue.serviceDetail}</FLD>
      <FLD NAME="I_XTYPE" TYPE="Char"></FLD>
      <FLD NAME="I_XTIME" TYPE="Char">${this.addJobCardForm.value.time}</FLD>
      </PARAM>]]>\n`;
          if (this.utilService.isOnline) {
            this.soap.createClient(environment.soap + '/soap-wsdl/syracuse/collaboration/syracuse/CAdxWebServiceXmlCC?wsdl', {
              attributesKey: 'attributes', valueKey: '$value', xmlKey: '$xml'
            }).then(client => {
              client.setSecurity(new security.BasicAuthSecurity(environment.soapUsername, environment.soapPassword, ''))
              client.call('run', {
                callContext: {
                  $xml: callcontent,
                  attributes: {
                    'xsi:type': "wss:CAdxCallContext"
                  },
                },
                publicName: {
                  attributes: {
                    'xsi:type': "xsd:string"
                  },
                  $value: 'X1CJOBCARD'
                },
                inputXml: {
                  attributes: {
                    'xsi:type': "xsd:string"
                  },
                  $xml: value
                }
              }).subscribe((res: ISoapMethodResponse) => {
                this.utilService.dismissLoading();
                if (res.result.runReturn.resultXml?.$value) {
                  const result = res.result.runReturn.resultXml.$value.RESULT.GRP.FLD;
                  if (result[18].$value == "2") {
                    this.utilService.showToastSucccess("Job created successfully");
                    this.routesService.jobAddStatusChange({ serviceRequest: this.stopId, routeNumber: this.routeId, product: this.productCode, installBaseId: this.installBaseId }).subscribe(() => {
                      this.updateInstallBaseService({ ServiceRequest: this.stopId, Product: this.productCode });
                      this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details'], { queryParams: { podId: this.stopId } });
                    }, (err: any) => {
                      this.utilService.dismissLoading();
                      this.utilService.showErrorCall(err);
                    })
                  }
                } else {
                  const result = res.result.runReturn?.messages[0].message;
                  this.utilService.showToast(result)
                }
              }, err => {
                console.log(err);
                this.utilService.showToast();
                this.utilService.dismissLoading();
              });
            }).catch(err => {
              console.log(err);
              this.utilService.showToast();
              this.utilService.dismissLoading();
            });
          } else {
            await this.utilService.storeApiIntoPending('X1CJOBCARD', value, 'soap', '', this.stopId);
            await this.utilService.storeApiIntoPending('/jobAddStatusChange', { serviceRequest: this.stopId, routeNumber: this.routeId, product: this.productCode }, 'post', '', this.stopId);
            const params: any = {
              jobcard: JobID,
              ServiceRequest: this.stopId,
              InstallBase: this.installBaseId,
              Product: this.productCode,
              Technician: this.Technician[0]?.XUSER_0,
              startDate: this.startDate,
              EndDate: this.endDate,
              StartTime: this.start,
              EndTIME: this.end,
              Duration: this.formattedDuration,
              CustomerCode: this.customerDetail.ClientCode,
              customerName: this.customerDetail.ClinetName,
              ServiceResponse: '',
              TechnicianName: this.Technician[0]?.Name
            }
            this.utilService.getStorageData('jobCardDetails').then(data => {
              data = data ?? [];
              data.push(params);
              this.utilService.setStorageData('jobCardDetails', data);
            });
            this.router.navigate(['/tabs/stop-list/stop-detail/pod/capture-details'], { queryParams: { podId: this.stopId } });
            this.updateInstallBaseService({ ServiceRequest: this.stopId, Product: this.productCode, InstallBase: this.installBaseId });
            setTimeout(() => {
              this.utilService.dismissLoading();
            }, 500);
          }
        }
      })
    })
  }
  async updateInstallBaseService(params) {
    const installBases = (await this.utilService.getStorageData('installBase'));
    installBases[params.ServiceRequest].map((x, index) => {
      x['service'].map((y, i) => {
        if (x.InstallBase == params.InstallBase && y.Product == params.Product) {
          installBases[params.ServiceRequest][index]['service'][i] = {
            ...y,
            Duration: this.formattedDuration,
            XFLAG_0: 3
          }
        }
      })
    })
    this.utilService.setStorageData('installBase', installBases);
  }

  startTimer() {
    if (!this.isRunning) {
      this.startTime = new Date();
      this.startDate = moment(new Date(this.startTime)).format('MM-DD-YYYY');
      this.start = moment(new Date(this.startTime)).format('hh:mm:ss');
      this.isRunning = true;
      this.isPaused = false;
      this.timerInterval = setInterval(() => {
        this.updateTime();
      }, 1000);
      this.updateJobCardDetail();
    }
  }

  updateJobCardDetail(): void {
    this.utilService.getStorageData('jobCardDetails').then(data => {
      data = data ?? [];
      const fIndex = findIndex(data, {
        ServiceRequest: this.stopId,
        InstallBase: this.installBaseId,
        Product: this.productCode
      });
      if (fIndex > -1)
        data[fIndex] = {
          ...data[fIndex],
          ...this.jobDetailList
        };
      this.utilService.setStorageData('jobCardDetails', data);
    });
  }

  pauseResumeTimer() {
    if (this.isRunning && !this.isPaused) {
      const pauseTime = new Date();
      this.pause = moment(new Date(pauseTime)).format('MM-DD-YYYY , hh:mm:ss');
      this.pausedTime = new Date().getTime();
      clearInterval(this.timerInterval);
      this.isPaused = true;
    } else if (this.isPaused) {
      const pauseDuration = new Date().getTime() - (this.pausedTime || 0);
      this.startTime = new Date(this.startTime!.getTime() + pauseDuration);
      this.resume = moment(new Date(this.startTime)).format('MM-DD-YYYY , hh:mm:ss');
      this.isPaused = false;
      this.timerInterval = setInterval(() => {
        this.updateTime();
      }, 1000);
    }
  }

  stopTimer() {
    if (this.isRunning) {
      this.isBtnDisable = false;
      const EndTime = new Date();
      this.endDate = moment(new Date(EndTime)).format('MM-DD-YYYY');
      this.end = moment(new Date(EndTime)).format('hh:mm:ss');
      clearInterval(this.timerInterval);
      this.isRunning = false;
      this.isPaused = false;
      this.startTime = null;
      this.timeForm.patchValue({
        jobtime: this.formattedTime
      })
      this.updateJobCardDetail();
      this.formattedTime = '00:00:00';
    }
  }

  private updateTime() {
    if (this.startTime && !this.isPaused) {
      const currentTime = new Date();
      const elapsedTime = currentTime.getTime() - this.startTime.getTime();
      this.formattedTime = this.msToTime(elapsedTime);
    }
  }

  private msToTime(duration: number): string {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    const displayHours = (hours < 10) ? '0' + hours : hours;
    const displayMinutes = (minutes < 10) ? '0' + minutes : minutes;
    const displaySeconds = (seconds < 10) ? '0' + seconds : seconds;

    return displayHours + ':' + displayMinutes + ':' + displaySeconds;
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
  }
  
  getJobCardDetail() {
    const params = {
      service_request_number: this.stopId,
      installBase: this.installBaseId,
      ServiceProduct: this.productCode
    }
    // this.utilService.showLoading();
    this.routesService.jobCardDetail(params).subscribe(res => {
      setTimeout(() => {
        this.utilService.dismissLoading();
      }, 100);
      if (res) {
        this.jobDetailList = res;
        this.isConfirm = true;
        if (res.ServiceDetails) {
          this.addJobCardForm.patchValue({
            serviceDetail: res.ServiceDetails
          })
        }
        if (res.Time != ' ') {
          this.addJobCardForm.patchValue({
            time: res.Time
          })
        }
        if (res.Duration != ' ') {
          this.formattedTime = res.Duration
          this.timeForm.patchValue({
            jobtime: res.Duration
          })
        }
        
        if (this.addJobCardForm.get('serviceDetail').value) {
          this.addJobCardForm.get('serviceDetail').disable();
        }
        this.timeForm.get('jobtime')?.disable();
        this.addJobCardForm.get('time')?.disable();
      }
    });
  }

  validateAndFormatTime(event: any) {
    let timeValue = event.target.value;
    const timePattern = /^([0-9]{2}):([0-9]{2}):([0-9]{2})$/;
    if (timePattern.test(timeValue)) {
      let timeParts = timeValue.split(':');
      let hours = parseInt(timeParts[0], 10);
      let minutes = parseInt(timeParts[1], 10);
      let seconds = parseInt(timeParts[2], 10);
      if (minutes > 59) {
        hours += Math.floor(minutes / 60);
        minutes = minutes % 60;
      }
      if (seconds > 59) {
        minutes += Math.floor(seconds / 60);
        seconds = seconds % 60;
      }
      let formattedTime = this.padToTwoDigits(hours) + ':' + this.padToTwoDigits(minutes) + ':' + this.padToTwoDigits(seconds);
      this.timeForm.get('jobtime')?.setValue(formattedTime);
      event.target.value = formattedTime;
    } else {
      this.timeForm.get('jobtime')?.setValue('');
    }
  }

  padToTwoDigits(number: number) {
    return number.toString().padStart(2, '0');
  }

  validateAndFormat(event: any) {
    const timeValue = event.target.value;
    const timePattern = /^([0-9]{2}):([0-9]{2})(?::([0-9]{2}))?$/;
    if (timePattern.test(timeValue)) {
      const timeParts = timeValue.split(':');
      let hours = parseInt(timeParts[0], 10);
      let minutes = parseInt(timeParts[1], 10);
      if (minutes > 59) {
        hours += Math.floor(minutes / 60);
        minutes = minutes % 60;
      }
      const formattedTime =
        this.padToTwoDigits(hours) +
        ':' +
        this.padToTwoDigits(minutes)

      this.addJobCardForm.get('time')?.setValue(formattedTime);
      event.target.value = formattedTime;
    } else {
      this.addJobCardForm.get('time')?.setValue('');
    }
  }

  goToHome(){
    this.router.navigate(['tabs/routes']);
  }
}
