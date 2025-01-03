import { Injectable } from '@angular/core';
import { defer, of } from 'rxjs';
import { sortBy, groupBy, findIndex, find } from 'lodash';
import { CommonService } from './common.service';
import { UtilService } from './util.service';
import { tap, filter, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RoutesService {

  constructor(
    private commonService: CommonService,
    private utilService: UtilService
  ) { }

  oprimizeRoute() {
    return this.commonService.get('/optimize');
  }

  getRoutes(params: any) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData('routes');
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.post('/Routes', params).pipe(
        // filter(data => data.length > 0),
        tap(routes => {
          this.utilService.setStorageData('routes', routes);
        })
      );
    }
  }

  getHistory(ID: string) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData('history');
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get('/History/' + ID);
    }
  }

  getStops(routeId: string, isAll = false) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(async () => {
          return (await this.utilService.getStorageData('stops'))[routeId];
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get('/Stops/' + routeId).pipe(
        tap(async (stops) => {
          if (!isAll) {
            const data = await this.utilService.getStorageData('stops') ?? {};
            data[routeId] = sortBy(stops, 'XCSGNUM_0');
            await this.utilService.setStorageData('stops', data);
          };
        })
      );
    }
  }

  getStopsDetails(stopId: string) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(async () => {
          return (await this.utilService.getStorageData('documentInfo'))[stopId];
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get(`/Documentinfo/${stopId}`).pipe(
        tap(async (documentInfo) => {
          await this.utilService.getStorageData('documentInfo').then(data => {
            data = data ?? {};
            data[stopId] = documentInfo;

            this.utilService.setStorageData('documentInfo', data);
          });
        })
      );
    }
  }

  getDocumentDetails(stopId: string) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(async () => {
          return (await this.utilService.getStorageData('documentDetail'))[stopId];
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get(`/DocumentDet/${stopId}`).pipe(
        tap(async (documentDetail) => {
          await this.utilService.getStorageData('documentDetail').then(data => {
            data = data ?? {};
            data[stopId] = documentDetail;
            this.utilService.setStorageData('documentDetail', data);
          });
        })
      );
    }
  }

  getPod(stopId: string) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(async () => {
          return (await this.utilService.getStorageData('podDetail'))[stopId];
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get(`/PODDet/${stopId}`).pipe(
        tap(async (podDetail) => {
          await this.utilService.getStorageData('podDetail').then(data => {
            data = data ?? {};
            data[stopId] = podDetail;
            this.utilService.setStorageData('podDetail', data);
          });
        })
      );
    }
  }

  getPodReport(podRepId) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData('podrep').then(
            podrep => {
              return podrep.filter(d => d.XDOCNUM_0 == podRepId);
            });
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get('/PODRep/' + podRepId);
    }
  }

  getStartRoute(startRouteId: any) {
    return this.commonService.post('/DocSta', startRouteId);
  }

  updateStartRoute(startRouteId: any) {
    return this.commonService.post('/startRoute', startRouteId);
  }

  postSkipRoute(params: any) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData('DocSkip');
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.post('/DocSkip', params);
    }
  }

  postCancelRoute(params: any) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData('DocSkip');
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.post('/DocSkip', params);
    }
  }

  postStatus(params: any) {
    return this.commonService.post('/PODStatus', params);
  }

  getProductList() {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData('product');
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get('/productList').pipe(
        tap(products => {
          this.utilService.setStorageData('product', products);
        })
      );
    }
  }

  postCheckIn(params: any) {
    // if (!navigator.onLine || !this.utilService.isOnline) {
    //   try {
    //     return defer(() => {
    //       return this.utilService.getStorageData('CheckIn');
    //     });
    //   } catch (error) {
    //     return of([]);
    //   }
    // } else {
    return this.commonService.post('/CheckIn', params);
    // }
  }

  docReschedule(params: any) {
    return this.commonService.post('/DocRes', params)
  }

  postCheckOut(params: any) {
    return this.commonService.post('/CheckOut', params);
  }

  customerAvailable(params: any) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData('custAvail');
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.post('/Custavail', params)
    }
  }

  skipReason() {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData('skipReasons');
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get('/SkipReasons');
    }
  }

  cancelReasons() {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData('cancelReasons');
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get('/CancelReasons');
    }
  }

  rescheduleReasons() {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData('reschedReasons');
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get('/ReschedReasons');
    }
  }

  updateStatus(id) {
    return this.commonService.get(`/updateStatus/${id}`);
  }

  rescheduleReason(params) {
    return this.commonService.post(`/updateReschedule`, params);
  }

  incidentReasons() {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData('incidentReasons');
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get('/IncidentReasons');
    }
  }
  getPartDetails(stopId) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(async () => {
          return (await this.utilService.getStorageData('partsDetails'))[stopId];
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get(`/getServiceParts/${stopId}`).pipe(
        tap(async (PartDetail) => {
          await this.utilService.getStorageData('partsDetails').then(data => {
            data = data ?? {};
            data[stopId] = PartDetail;
            this.utilService.setStorageData('partsDetails', data);
          });
        })
      );
    }
  }

  installBase(stopId) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(async () => {
          return (await this.utilService.getStorageData('installBase'))[stopId];
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.post('/InstallBase', { id: stopId });
    }
  }

  addLineNumber(params) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      // this.utilService.storeApiIntoPendingForLineNumber('/addLineNumber', params, 'post');
      return of([]);
    } else {
      return this.commonService.post('/addLineNumber', params);
    }
  }

  jobAddStatusChange(params) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData('jobAddStatusChange');
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.post('/jobAddStatusChange', params);
    }
  }

  installBaseDetails(params) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData('installBaseDetail');
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.post('/InstallBaseDetails', params).pipe(
        map(data => {
          data.part = data.filter(x => x.ProductType == 2);
          data.service = data.filter(x => x.ProductType == 3);
          return data;
        })
      );
    }
  }

  getParts(routeId, isAll = false) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(async () => {
          return (await this.utilService.getStorageData('parts'))[routeId];
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.post('/Parts', { routeId }).pipe(
        tap(async (parts) => {
          if (!isAll) {
            const data = await this.utilService.getStorageData('parts') ?? {};
            data[routeId] = parts;
            await this.utilService.setStorageData('parts', data);
          }
        })
      );
    }
  }

  getPartList(routeId, isAll = false) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(async () => {
          return (await this.utilService.getStorageData('partsList'))[routeId];
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.post('/partList', { routeId }).pipe(
        tap(async (parts) => {
          if (!isAll) {
            const data = await this.utilService.getStorageData('partsList') ?? {};
            data[routeId] = parts;
            await this.utilService.setStorageData('partsList', data);
          }
        })
      );
    }
  }

  getServices(site) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(async () => {
          return (await this.utilService.getStorageData('services'))[site];
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.post('/Service', { site }).pipe(
        tap(async (services) => {
          setTimeout(async () => {
            await this.utilService.getStorageData('services').then(data => {
              data = data ?? {};
              data[site] = services;
              this.utilService.setStorageData('services', data);
            });
          }, 1000);
        })
      );
    }
  }

  deletePartService(params) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      this.utilService.storeApiIntoPending('/deletePartService', params, 'post');
      return of([]);
    } else {
      return this.commonService.post('/deletePartService', params);
    }
  }

  deleteServiceProduct(params) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      
      this.utilService.storeApiIntoPending('/deleteServiceProduct', params, 'post');
      return of([]);
    } else {
      return this.commonService.post('/deleteServiceProduct', params);
    }
  }
  updatePartQuantity(params) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      this.utilService.storeApiIntoPending('/updatePartQuantity', params, 'post','',params.ServiceRequest);
      return of([]);
    } else {
    return this.commonService.post('/updatePartQuantity', params);
    }
  }
  
  updateQuantity(params) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      this.utilService.storeApiIntoPending('/updateQuantity', params, 'post','',params.ServiceRequest);
      return of([]);
    } else {
    return this.commonService.post('/updateQuantity', params);
     }
  }

  addProduct(params, isStoreData = false, storeData?) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      return defer(async () => {
        if (isStoreData) {
          this.utilService.storeApiIntoPendingForLineNumber('/addProduct', storeData, 'post', '', params.ServiceRequest);
          const installBases = (await this.utilService.getStorageData('installBase'));

          storeData.map((subService, index) => {
            if (index != 0) {
              const type = subService.XTYPE_0 == 2 ? 'part' : 'service';
              installBases[subService.ServiceRequest].map((x: any, i) => {
                if (subService.baseNumber == x.InstallBase) {
                  if (installBases[subService.ServiceRequest][i][type]) {
                    installBases[subService.ServiceRequest][i][type].push({
                      ...subService,
                      Duration: null,
                      XFLAG_0: 2
                    })
                  } else {
                    installBases[subService.ServiceRequest][i]['service'].push({
                      ...subService,
                      Duration: null,
                      XFLAG_0: 2
                    })
                  }
                }
              })
            }
          })
          return await this.utilService.setStorageData('installBase', installBases);
        } else {
          return [];
        }
      });
    } else {
      return this.commonService.post('/addProduct', params);
    }
  }

  jobCardDetail(params, isAll = false) {
    const filter = {
      InstallBase: params.installBase,
      Product: params.ServiceProduct,
      ServiceRequest: params.service_request_number
    };
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(async () => {
          return find((await this.utilService.getStorageData('jobCardDetails')), filter);
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.post('/jobCardDetail', params).pipe(
        tap((jobCardDetail) => {
          if (jobCardDetail && !isAll) {
            this.utilService.getStorageData('jobCardDetails').then(data => {
              data = data ?? [];
              const fIndex = findIndex(data, filter);
              if (fIndex > -1)
                data[fIndex] = jobCardDetail;
              else
                data.push(jobCardDetail);
              this.utilService.setStorageData('jobCardDetails', data);
            });
          }
        })
      );
    }
  }

  startTime(params) {
    return this.commonService.post('/startTime', params);
  }

  endTime(params) {
    return this.commonService.post('/endTime', params);
  }

  updateServiceDateTime(params) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      this.utilService.storeApiIntoPending('/updateDateTime', params, 'post', '', params.ServiceRequest);
      return of([]);
    } else {
      return this.commonService.post('/updateDateTime', params);
    }
  }

  updateDepartureTime(params) {
    return this.commonService.post('/time_departure', params);
  }

  getCustomerDetail(id) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData(id);
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get(`/customerDetail/${id}`);
    }
  }

  getSiteList() {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData('site');
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get('/siteList').pipe(
        tap(sites => {
          this.utilService.setStorageData('site', sites);
        })
      );
    }
  }

  getCustomerList(type) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData('customer');
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get(`/customerList/${type}`).pipe(
        tap(customers => {
          this.utilService.setStorageData('customer', customers);
        })
      );
    }
  }

  getAllAddress() {
    return this.commonService.get('/getalladdress').pipe(
      tap(addresses => {
        this.utilService.setStorageData('address', groupBy(addresses, 'CustomerCode'));
      })
    );
  }

  getSyncAddress() {
    const groupedData: any = {};
    return this.commonService.get(`/syncAddressList`).pipe(
      tap(async (addresses) => {
        addresses.forEach(item => {
          if (!groupedData[item.CustomerCode]) {
            groupedData[item.CustomerCode] = [];
          }
          groupedData[item.CustomerCode].push({
            AddressCodes: item.AddressCodes, AddressName: item.AddressName,
            BPCNAM_0: item.BPCNAM_0, Email: item.Email, Mobile: item.Mobile,
            City: item.City, Latitude: item.Latitude, Longitude: item.Longitude, PostalCode: item.PostalCode
          });
        });
        this.utilService.setStorageData('address', groupedData);
      })
    );
  }

  getAddressList(code) {
    const groupedData: any = {};
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(async () => {
          return (await this.utilService.getStorageData('address'))[code];
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get(`/addressList/${code}`).pipe(
        tap(async (addresses) => {
          addresses.forEach(item => {
            if (!groupedData[item.CustomerCode]) {
              groupedData[item.CustomerCode] = [];
            }
            groupedData[item.CustomerCode].push({
              AddressCodes: item.AddressCodes, AddressName: item.AddressName,
              BPCNAM_0: item.BPCNAM_0, Email: item.Email, Mobile: item.Mobile,
              City: item.City, Latitude: item.Latitude, Longitude: item.Longitude, PostalCode: item.PostalCode
            });
          });
          this.utilService.setStorageData('address', groupedData);
          //   await this.utilService.getStorageData('address').then(data => {
          //     data = data ?? {};
          //     data[code] = addresses;
          //     console.log('data',data);
          //     this.utilService.setStorageData('address', data);
          //   });
        })
      );
    }
  }

  getSyncInstallBase() {
    const groupedInstallData: any = {};
    return this.commonService.get(`/syncInstallBase`).pipe(
      tap(async (installBaseList) => {
        installBaseList.forEach(item => {
          if (!groupedInstallData[item.Customer]) {
            groupedInstallData[item.Customer] = [];
          }
          groupedInstallData[item.Customer].push(item);
        });
        this.utilService.setStorageData('installBaseList', groupedInstallData);
      })
    );
  }

  getInstallBaseList(id) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(async () => {
          return (await this.utilService.getStorageData('installBaseList'))[id];
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get(`/installBaseLists/${id}`).pipe(
        tap(async (installBaseList) => {
          await this.utilService.getStorageData('installBaseList').then(data => {
            data = data ?? {};
            data[id] = installBaseList;
            this.utilService.setStorageData('installBaseList', data);
          });
        })
      );
    }
  }

  getSkillGroup(id) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData('skill');
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get(`/skillGroup/${id}`);
    }
  }

  getQuestionList(id, isAll = false) {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(async () => {
          return (await this.utilService.getStorageData('questionList'))[id];
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get(`/questionList/${id}`).pipe(
        tap(async (questionList) => {
          if (!isAll) {
            await this.utilService.getStorageData('questionList').then(data => {
              data = data ?? {};
              data[id] = questionList;
              this.utilService.setStorageData('questionList', data);
            });
          }
        })
      );
    }
  }

  getAnswerList() {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData('answerList');
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get(`/answerList`);
    }
  }

  getRescheduleList() {
    if (!navigator.onLine || !this.utilService.isOnline) {
      try {
        return defer(() => {
          return this.utilService.getStorageData('reasonRescheduleList');
        });
      } catch (error) {
        return of([]);
      }
    } else {
      return this.commonService.get(`/reasonRescheduleList`);
    }
  }

  updateQuestionAnswer(params) {
    return this.commonService.post(`/updateQuestionAnswer`, params);
  }

  getUserStatus(id) {
    return this.commonService.get(`/userStatus/${id}`);
  }
}
