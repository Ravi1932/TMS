import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AllApiService } from 'src/app/services/all-api.service';
import { RoutesService } from 'src/app/services/routes.service';
import { UtilService } from 'src/app/services/util.service';
import * as moment from 'moment';
import { ModalController } from '@ionic/angular';
@Component({
  selector: 'app-sync-data',
  templateUrl: './sync-data.component.html',
  styleUrls: ['./sync-data.component.scss'],
})
export class SyncDataComponent implements OnInit {
  skillGroupList;
  customerList;
  currentDate;
  isSite = false;
  isCustomer = false;
  isAddress = false;
  isInstallBase = false;
  isSkill = false;
  isRoutes = false;
  constructor(private routesService: RoutesService,
    private utilService: UtilService,
    private router: Router,
    private allApiService: AllApiService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
  }

  getSite(type?) {
    if (type == 1) {
      this.utilService.showLoading();
    }
    this.currentDate = moment(new Date()).format('MM-DD-YYYY HH:mm');
    this.routesService.getSiteList().subscribe(res => {
      this.isSite = true;
      if (type == 1) {
        this.utilService.dismissLoading();
        this.utilService.showToastSucccess('Site sync successfully');
      }
    }, err => {
      this.utilService.showToast('Something Wrong!');
    });
  }

  getSkillGroup(type?) {
    if (type == 1) {
      this.utilService.showLoading();
    }
    this.currentDate = moment(new Date()).format('MM-DD-YYYY HH:mm');
    const driverId = localStorage.getItem('podDriverId');
    this.routesService.getSkillGroup(driverId).subscribe(res => {
      this.isSkill = true;
      if (type == 1) {
        this.utilService.dismissLoading();
        this.utilService.showToastSucccess('Skill sync successfully');
      }
      if (res) {
        this.skillGroupList = res;
        this.utilService.setStorageData('skill', this.skillGroupList);
      } else {
        this.utilService.showToast('Something Wrong!');
      }
    })
  }

  getCustomer(type?) {
    if (type == 1) {
      this.utilService.showLoading();
    }
    this.currentDate = moment(new Date()).format('MM-DD-YYYY HH:mm');
    this.routesService.getCustomerList(2).subscribe(res => {
      this.isCustomer = true;
      if (type == 1) {
        this.utilService.dismissLoading();
        this.utilService.showToastSucccess('Customer sync successfully');
      }
    }, err => {
      this.utilService.showToast('Something Wrong!');
    });
  }

  getRoutes() {
    localStorage.setItem('type', '1');
    this.allApiService.initOfflineData();
    this.isRoutes = true;
  }

  allSync() {
    this.currentDate = moment(new Date()).format('MM-DD-YYYY HH:mm');
    this.getSite();
    this.getSkillGroup();
    this.getCustomer();
    this.getAddress();
    this.getInstallBase();
    this.allApiService.initOfflineData();
    this.isRoutes = true;
  }

  getAddress(type?) {
    if (type == 1) {
      this.utilService.showLoading();
    }
    this.currentDate = moment(new Date()).format('MM-DD-YYYY HH:mm');
    this.routesService.getSyncAddress().subscribe(res => {
      this.isAddress = true;
      if (type == 1) {
        this.utilService.dismissLoading();
        this.utilService.showToastSucccess('Address sync successfully');
      }
    });
  }

  getInstallBase(type?) {
    if (type == 1) {
      this.utilService.showLoading();
    }
    this.currentDate = moment(new Date()).format('MM-DD-YYYY HH:mm');
    this.routesService.getSyncInstallBase().subscribe(res => {
      this.isInstallBase = true;
      if (type == 1) {
        this.utilService.dismissLoading();
        this.utilService.showToastSucccess('InstallBase sync successfully');
      }
    });
  }

  goTo() {
    this.modalController.dismiss();
    this.router.navigate(['/tabs/routes']);
  }
}
