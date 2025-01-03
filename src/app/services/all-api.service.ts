import { Injectable } from '@angular/core';
import { RoutesService } from './routes.service';
import { UtilService } from './util.service';
import { uniq, cloneDeep, findIndex, sortBy } from 'lodash';
import { Router } from '@angular/router';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class AllApiService {
  customerDetail;
  siteList;
  skillGroupList;
  customerList;
  addressList;
  installBaseList;
  answerList;
  totalRoutesParts: any = [];
  totalRoutesStops: any = [];
  totalInstallBase: any = [];
  totalInstallBaseDetail: any = [];
  currentInstallBase: any = [];
  servicesArray: any = [];
  Type;
  constructor(
    private routesService: RoutesService,
    private utilService: UtilService,
    private router: Router
  ) { }

  initOfflineData() {
    this.utilService.showLoading();
    this.getRoutes();
    this.Type = localStorage.getItem('type');
  }

  getRoutes() {
    const driverId = localStorage.getItem('podDriverId');
    const params = {
      driverId: driverId,
      type: 2
    }
    this.routesService.getRoutes(params).subscribe(async (routes: any) => {
      if (routes && routes.length > 0) {
        this.totalRoutesParts = cloneDeep(routes);
        this.totalRoutesStops = cloneDeep(routes);
        this.getParts();
        this.getStops();
      } else {
        this.utilService.dismissLoading();
      }
    }, (err: any) => {
      this.utilService.showErrorCall(err);
    });
  }

  async getParts() {
    let currentIndex = this.totalRoutesParts.length - 1;
    this.partsAPICallAndStoreData(this.totalRoutesParts[currentIndex].XDRN_0);
  }

  async partsAPICallAndStoreData(routerId) {
    await this.routesService.getParts(routerId, true).subscribe(async (response) => {
      const data = await this.utilService.getStorageData('parts') ?? {};
      data[routerId] = response;
      await this.utilService.setStorageData('parts', data);
      let findIndex = this.totalRoutesParts.findIndex((rout) => rout.XDRN_0 === routerId);
      this.totalRoutesParts.splice(findIndex, 1);
      if (this.totalRoutesParts && this.totalRoutesParts.length > 0) {
        setTimeout(() => {
          this.getParts();
        }, 1000);
      }
    });
  }

  async getStops() {
    let currentIndex = this.totalRoutesStops.length - 1;
    this.stopsAPICallAndStoreData(this.totalRoutesStops[currentIndex].XDRN_0);
  }

  async stopsAPICallAndStoreData(routerId) {
    await this.routesService.getStops(routerId, true).subscribe(async (response) => {
      this.totalInstallBase = cloneDeep(response);
      const data = await this.utilService.getStorageData('stops') ?? {};
      data[routerId] = sortBy(response, 'XCSGNUM_0');
      await this.utilService.setStorageData('stops', data);
      let findIndex = this.totalRoutesStops.findIndex((rout) => rout.XDRN_0 === routerId);
      this.totalRoutesStops.splice(findIndex, 1);
      if (this.totalInstallBase && this.totalInstallBase.length > 0) {
        this.getInstallBase();
      } else {
        this.findAndNextAPICall();
      }
    });
  }

  getInstallBase() {
    let currentIndex = this.totalInstallBase.length - 1;
    this.installBaseAPICallAndStoreData(this.totalInstallBase[currentIndex].XDOCNUM_0);
    this.servicesArray.push(this.totalInstallBase[currentIndex].XSTOFCY_0);
    this.getRoutesService(this.totalInstallBase[currentIndex].XDOCNUM_0);
  }

  async installBaseAPICallAndStoreData(stopId) {
    await this.routesService.installBase(stopId).subscribe(async (response) => {
      response.forEach(request => {
        if (!request.hasOwnProperty('part')) {
          request['part'] = [];
        }
        if (!request.hasOwnProperty('service')) {
          request['service'] = [];
        }
      });
      this.totalInstallBaseDetail = _.cloneDeep(response);

      let findIndex = this.totalInstallBase.findIndex((rout) => rout.XDOCNUM_0 === stopId);
      this.totalInstallBase.splice(findIndex, 1);
      if (this.totalInstallBaseDetail && this.totalInstallBaseDetail.length > 0) {
        this.getInstallBaseDetail(stopId);
      } else {
        this.findAndNextAPICall();
      }
    });
  }

  getInstallBaseDetail(stopId) {
    let currentIndex = this.totalInstallBaseDetail.length - 1;
    this.installBaseDetailAPICallAndStoreData(stopId, this.totalInstallBaseDetail[currentIndex].InstallBase, this.totalInstallBaseDetail[currentIndex]);
  }

  installBaseDetailAPICallAndStoreData(stopId: string, installBaseId: string, installBase: any) {
    this.routesService.installBaseDetails({ id: stopId, instabaseId: installBaseId }).subscribe(async (resp: any) => {
      if (!resp.part) {
        installBase.part = [];
      } else {
        installBase.part = resp.part;
      }
      installBase.service = resp.service;
      await this.utilService.getStorageData('installBase').then(data => {
        data = data ?? {};
        data[stopId] = this.totalInstallBaseDetail;
        this.utilService.setStorageData('installBase', data);
      });
      this.currentInstallBase = cloneDeep(installBase);
      if (this.currentInstallBase.service && this.currentInstallBase.service.length > 0) {
        this.getJobCardDetail(stopId);
      } else {
        this.findAndNextAPICall();
      }
    });
  }

  getJobCardDetail(stopId: string) {
    let currentIndex = this.currentInstallBase.service.length - 1;
    this.getJobCardDetailAPICallAndStore(stopId, this.currentInstallBase.service[currentIndex].Product);
  }

  getJobCardDetailAPICallAndStore(stopId: string, ServiceProduct: string) {
    this.routesService.jobCardDetail({
      service_request_number: stopId,
      installBase: this.currentInstallBase.InstallBase,
      ServiceProduct: ServiceProduct
    }, true).subscribe(async (res) => {
      let johCardDetails = await this.utilService.getStorageData('jobCardDetails');
      johCardDetails = johCardDetails ?? [];
      const filter = {
        InstallBase: this.currentInstallBase.InstallBase,
        Product: ServiceProduct,
        ServiceRequest: stopId
      };
      const fIndex = findIndex(johCardDetails, filter);
      if (fIndex > -1) {
        johCardDetails[fIndex] = res;
      } else {
        johCardDetails.push(res);
      }
      await this.utilService.setStorageData('jobCardDetails', johCardDetails);

      let findIndexCurrentInstallBase = this.currentInstallBase.service.findIndex((rout) => rout.Product === ServiceProduct);
      this.currentInstallBase.service.splice(findIndexCurrentInstallBase, 1);
      this.findAndNextAPICall(stopId);
    });
  }

  getService() {
    let currentIndex = this.servicesArray.length - 1;
    this.serviceAPICallAndStore(this.servicesArray[currentIndex]);
  }

  serviceAPICallAndStore(serviceID) {
    this.routesService.getServices(serviceID).subscribe(async (res) => {
      let findIndex = this.servicesArray.findIndex((service) => service === serviceID);
      this.servicesArray.splice(findIndex, 1);
      if (this.servicesArray && this.servicesArray.length > 0) {
        setTimeout(() => {
          this.getService();
        }, 1000);
      } else {
        this.utilService.dismissLoading();
        if (this.Type != '1') {
          this.router.navigate(['/tabs/routes']);
        } else {
          localStorage.removeItem('type');
        }
        this.utilService.showToastSucccess('Sync Data successfully');
      }
    });
  }

  findAndNextAPICall(stopId?) {
    if (this.totalInstallBase.service && this.totalInstallBase.service.length > 0) {
      setTimeout(() => {
        this.getJobCardDetail(stopId);
      }, 1000);
    } else if (this.totalInstallBase && this.totalInstallBase.length > 0) {
      setTimeout(() => {
        this.getInstallBase();
      }, 1000);
    } else if (this.totalRoutesStops && this.totalRoutesStops.length > 0) {
      setTimeout(() => {
        this.getStops();
      }, 1000);
    } else {
      if (this.servicesArray && this.servicesArray.length > 0) {
        this.servicesArray = uniq(this.servicesArray);
        this.getService();
      } else {
        this.utilService.dismissLoading();
        if (this.Type != '1') {
          this.router.navigate(['/tabs/routes']);
        } else {
          localStorage.removeItem('type');
        }
        this.utilService.showToastSucccess('Sync Data successfully');
      }
    }
  }

  getRoutesService(stopId) {
    if (stopId) {
      this.routesService.getPod(stopId).subscribe(async (res) => {
        await this.getDocumentDetails(stopId);
      });
    }
  }

  getDocumentDetails(stopId) {
    this.routesService.getDocumentDetails(stopId).subscribe(async (res) => {
      await this.getStopsDetails(stopId);
    });
  }

  getStopsDetails(stopId) {
    this.routesService.getStopsDetails(stopId).subscribe(async (res) => {
      await this.getCustomerDetail(stopId);
    });
  }

  getCustomerDetail(stopId) {
    this.routesService.getCustomerDetail(stopId).subscribe(async (res) => {
      await this.utilService.setStorageData(stopId, res);
      this.GetQuestionList(stopId);
    })
  }

  GetQuestionList(stopId) {
    this.routesService.getQuestionList(stopId, true).subscribe(async (res) => {
      if (res) {
        let data = await this.utilService.getStorageData('questionList');
        data = data ?? {};
        data[stopId] = res;
        await this.utilService.setStorageData('questionList', data);
        await this.GetAnswerList();
      }
    });
    this.serviceDetailParts(stopId);
  }

 serviceDetailParts(stopId) {
    this.routesService.getPartDetails(stopId).subscribe((resp: any) => {
    }, (err: any) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    })
  }

  GetAnswerList() {
    this.routesService.getAnswerList().subscribe(async (res) => {
      if (res) {
        await this.utilService.setStorageData('answerList', res);
      }
    });
    this.getProduct();
  }

  getProduct() {
    this.routesService.getProductList().subscribe(res => {
    }, err => {
      this.utilService.showToast('Something Wrong!');
    });
    this.rescheduleList();
  }

  rescheduleList() {
    this.routesService.getRescheduleList().subscribe(async(res) => {
      if (res) {
        await this.utilService.setStorageData('reasonRescheduleList', res);
      }
    }, err => {
      this.utilService.showToast('Something Wrong!');
    })
    
  }

  
}
