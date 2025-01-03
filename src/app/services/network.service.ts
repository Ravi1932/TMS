import { CommonService } from './common.service';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ISoapMethodResponse, NgxSoapService, security } from 'ngx-soap';
import { UtilService } from './util.service';

const callcontent = `
      <codeLang xsi:type="xsd:string">${environment.soapLanguage}</codeLang>
      <poolAlias xsi:type="xsd:string">${environment.soapPoolAlias}</poolAlias>
      <poolId xsi:type="xsd:string">?</poolId>
      <requestConfig xsi:type="xsd:string">?</requestConfig>
`;
@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  constructor(
    private utilService: UtilService,
    private soap: NgxSoapService,
    private commonService: CommonService,
  ) {
  }

  async isCallPendingApi() {
    if (this.utilService.isOnline) {
      setTimeout(() => {
        this.callPendingServiceRequestWebservice();
      }, 5000);
    }
  }

  async callPendingServiceRequestWebservice() {
    let localPendingApi = await this.utilService.getStorageData('pendingApiWebservice');
    if (localPendingApi && localPendingApi.length > 0) {
      for (let mainIndex = 0; mainIndex < localPendingApi.length; mainIndex++) {
        const api = localPendingApi[mainIndex];
        new Promise((resolve, reject) => {
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
                $value: api.endpoint
              },
              inputXml: {
                attributes: {
                  'xsi:type': "xsd:string"
                },
                $xml: api.payload
              }
            }).subscribe(async (res: ISoapMethodResponse) => {
              if (res.result.runReturn.resultXml?.$value) {
                const result = res.result.runReturn.resultXml.$value.RESULT.GRP.FLD;
                if (result[1].$value == "2") {
                  this.callPendingApiForLineNumber();
                } else {
                  this.removeFromAllAPIArray(api.searviceRequestNumber)
                }
              } else {
                this.removeFromAllAPIArray(api.searviceRequestNumber)
              }
              resolve(res);
            }, err => {
              reject(err);
              this.utilService.showToast();
              this.utilService.dismissLoading();
            });
          }).catch(err => {
            reject(err);
          });
        });
      }
      await this.utilService.removeStorageData('pendingApiWebservice');
    } else {
      this.callPendingApiForLineNumber();
    }
  }

  async removeFromAllAPIArray(searviceRequestNumber) {
    let localPendingApi = await this.utilService.getStorageData('pendingApiList');
    const newArray = localPendingApi.filter(item => item.searviceRequestNumber !== searviceRequestNumber);
    await this.utilService.setStorageData('pendingApiList', newArray);

    let localPendingApi1 = await this.utilService.getStorageData('pendingApiServiceRequest');
    const newArray1 = localPendingApi1.filter(item => item.searviceRequestNumber !== searviceRequestNumber);
    await this.utilService.setStorageData('pendingApiServiceRequest', newArray1);

    let localPendingApi2 = await this.utilService.getStorageData('pendingApiListLineNumber');
    const newArray2 = localPendingApi2.filter(item => item.searviceRequestNumber !== searviceRequestNumber);
    await this.utilService.setStorageData('pendingApiListLineNumber', newArray2);

    this.callPendingApiForLineNumber();
  }

  async callPendingApiForLineNumber() {
    let localPendingApi = await this.utilService.getStorageData('pendingApiListLineNumber');
    let lineNumber = 1;
    if (localPendingApi && localPendingApi.length > 0) {
      for (let mainIndex = 0; mainIndex < localPendingApi.length; mainIndex++) {
        const res = localPendingApi[mainIndex];
        await new Promise((resolve, reject) => {
          this.commonService.post("/addLineNumber", res.payload[0]).subscribe((subData) => {
            if (subData && subData != null) {
              lineNumber = subData;
            }
            this.makeSequentialAPICalls(res.payload);
            resolve('');
          }, err => {
            console.error(err);
            reject(err);
          });
        });
      }
      this.callPendingApi();
      await this.utilService.removeStorageData('pendingApiListLineNumber');
    } else {
      this.callPendingApi();
    }
  }

  async callPendingApi() {
    let localPendingApi = await this.utilService.getStorageData('pendingApiList');
    if (localPendingApi && localPendingApi.length > 0) {
      for (let mainIndex = 0; mainIndex < localPendingApi.length; mainIndex++) {
        const api = localPendingApi[mainIndex];
        if (api.type == 'post') {
          await this.commonService.post(api.endpoint, api.payload).toPromise();
        } else if (api.type == 'get') {
          await this.commonService.get(api.endpoint, api.payload).toPromise();
        } else {
          await this.callPendingWebService(api);
        }
      }
      this.callPendingApiForServiceRequest();
      await this.utilService.removeStorageData('pendingApiList');
    } else {
      this.callPendingApiForServiceRequest();
    }
  }

  async callPendingApiForServiceRequest() {
    let localPendingApi = await this.utilService.getStorageData('pendingApiServiceRequest');
    if (localPendingApi && localPendingApi.length > 0) {
      let I_XSDHNUM = true;
      for (let mainIndex = 0; mainIndex < localPendingApi.length; mainIndex++) {
        const serviceRequest = localPendingApi[mainIndex];
        await new Promise(async (resolve, reject) => {
          if (mainIndex % 3 === 0) {
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
                  $value: serviceRequest.endpoint
                },
                inputXml: {
                  attributes: {
                    'xsi:type': "xsd:string"
                  },
                  $xml: serviceRequest.payload
                }
              }).subscribe(async (res: ISoapMethodResponse) => {
                if (res.result.runReturn.resultXml?.$value) {
                  const result = res.result.runReturn.resultXml.$value.RESULT.GRP[1].FLD;
                  if (result[1].$value == 2) {
                    I_XSDHNUM = result[0].$value;
                  } else {
                    I_XSDHNUM = false;
                    mainIndex = mainIndex + 2;
                  }
                }
                resolve(res);
              }, err => {
                reject(err);
                this.utilService.showToast();
                this.utilService.dismissLoading();
              });
            }).catch(err => {
              reject(err);
            });
          }
          if (mainIndex % 3 !== 0 && I_XSDHNUM) {
            serviceRequest.payload = serviceRequest.payload.replace(/undefined/, I_XSDHNUM);
            await this.callPendingWebService(serviceRequest);
            resolve('');
          }
        });
      }
      await this.utilService.removeStorageData('pendingApiServiceRequest');
    }
  }

  async makeSequentialAPICalls(payload: any[]) {
    const payloadLength = payload.length;
    let lineNumber = 1;
    let completedCalls = 0;
    for (let index = 0; index < payloadLength; index++) {
      const params = payload[index];
      if (index !== 0) {
        params.line_number = lineNumber;
        try {
          await this.commonService.post('/addProduct', params).toPromise();
          lineNumber++;
          completedCalls++;
        } catch (err) {
          console.error(err);
          throw err;
        }
      } else {
        completedCalls++;
      }
    }
    if (completedCalls === payloadLength - 1) {
      return '';
    }
  }

  async callPendingWebService(api) {
    return new Promise((resolve, reject) => {
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
            $value: api.endpoint
          },
          inputXml: {
            attributes: {
              'xsi:type': "xsd:string"
            },
            $xml: api.payload
          }
        }).subscribe(async (res: ISoapMethodResponse) => {
          resolve(res);
        }, err => {
          reject(err);
          this.utilService.showToast();
          this.utilService.dismissLoading();
        });
      }).catch(err => {
        reject(err);
      });
    });
  }
}
