import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NgxSoapService, ISoapMethod, Client, ISoapMethodResponse, security } from 'ngx-soap';
import { ThisReceiver } from '@angular/compiler';
import { environment } from 'src/environments/environment';

const callcontent = `<poolAlias xsi:type="xsd:string">PRODDEMO</poolAlias>
       <poolId xsi:type="xsd:string">?</poolId>
       <requestConfig xsi:type="xsd:string">?</requestConfig>`;
const value = `
            <![CDATA[<PARAM>
            <FLD NAME="XIPADD" TYPE="Char">125.18.84.155</FLD>
           <FLD NAME="XPODPORT" TYPE="Integer">8124</FLD>
           <FLD NAME="XPODPOOL" TYPE="Char">PRODDEMO</FLD>
           <FLD NAME="XADSUSR" TYPE="Char">TESTUSER</FLD>
           <FLD NAME="XADSPWD" TYPE="Char">TU@123*</FLD>
            </PARAM>]]>
`
@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.page.html',
  styleUrls: ['./configuration.page.scss'],
})
export class ConfigurationPage implements OnInit {
  json = {
    RESULT: {
      GRP: [
        {
          ID: "GRP1",
          I_XSDHNUM: "SWBDE0120070",
          I_XPODREF: "POD-SWBDE0120070",
          I_XLOCLAT: 48.56,
          I_XLOCLOG: 47.66,
          I_XNOTE: "Testing Notes",
          I_XSIGNAME: "Bharath",
          I_XSIG: "Blob",
          I_XMACADD: "4A:21:56:97",
          I_XDEVICEID: "4A:21:56:97"
        },
        {
          ID: "GRP4",
          O_XFLG: 2,
          O_XMSG: "Delivered!!!",
        },
      ],
      TAB: [{
        DIM: 99,
        ID: "GRP2",
        SIZE: "2",
        LIN: [
          {
            NUM: 1,
            I_XSDDLIN: 1000,
            I_XITMREF: "BMS001",
            I_XDLVQTY: 1,
            I_XPODQTY: 1
          },
          {
            NUM: 2,
            I_XSDDLIN: 2000,
            I_XITMREF: "BMS002",
            I_XDLVQTY: 1,
            I_XPODQTY: 1
          }
        ]
      },
      {
        DIM: 6,
        ID: "GRP3",
        SIZE: "1",
        LIN: [
          {
            NUM: 1,
            I_XIMG: "Blob",
          },
          {
            NUM: 2,
            I_XIMG: "64 Bit",
          }
        ]
      }
      ],
    }
  };

  param = {
    param: [
      {
        XIPADD: "125.18.84.155",
        XPODPORT: 8124,
        XPODPOOL: "PRODDEMO",
        XADSUSR: "TESTUSER",
        XADSPWD: ""
      }
    ]
  }

  dataType = {
    I_XSDHNUM: "Char",
    I_XPODREF: "Char",
    I_XLOCLAT: "Char",
    I_XLOCLOG: "Char",
    I_XNOTE: "Char",
    I_XSIGNAME: "Char",
    I_XSIG: "Blob",
    I_XMACADD: "Char",
    I_XDEVICEID: "Char",

    O_XFLG: "Integer",
    O_XMSG: "Char",

    I_XSDDLIN: "Integer",
    I_XITMREF: "Char",

    I_XDLVQTY: "Decimal",
    I_XPODQTY: "Decimal",

    I_XIMG: "Blob"
  }

  submitted = false;

  configurationModel: any = {};

  constructor(
    private navCtrl: NavController,
    private httpClient: HttpClient,
    private soap: NgxSoapService,
  ) { }

  ngOnInit() {
    this.callSoapRequest();
  }

  jsonToXml() {

    for (let result in this.json) {
      const GROUP = this.json.RESULT.GRP;
      const TAB = this.json.RESULT.TAB;
      let RESULTTAG = "<" + result + ">";
      if (GROUP.length > 0) {
        let GRPTag = '';
        for (let i = 0; i < GROUP.length; i++) {
          let grp = GROUP[i];
          GRPTag += "\n\t<GRP ID=\"" + grp.ID + "\"";
          let FLDTag = '';
          for (let gData in grp) {
            if (gData !== 'ID') {
              FLDTag += "\n\t\t<FLD ";
              FLDTag += "NAME=\"" + gData + "\"" + " TYPE=\"" + this.dataType[gData] + "\">" + grp[gData] + "</FLD>";
            }
          }
          GRPTag += ">" + FLDTag + "\n\t" + "</GRP>";
        }
        RESULTTAG += GRPTag;
      }
      if (TAB.length > 0) {
        let TABTag = '';
        for (let tabLin in TAB) {
          let LIN = TAB[tabLin].LIN;
          TABTag += "\n\t<TAB DIM=\"" + TAB[tabLin].DIM + "\"" + " ID=\"" + TAB[tabLin].ID + "\"" + " SIZE=\"" + TAB[tabLin].SIZE + "\"";
          if (LIN.length > 0) {
            let LINTag = '';
            for (let j = 0; j < LIN.length; j++) {
              let tab = LIN[j];
              LINTag += "\n\t\t<LIN NUM=\"" + tab.NUM + "\"";
              let FLDTag = '';
              for (let tData in tab) {
                if (tData !== 'NUM') {
                  FLDTag += "\n\t\t\t<FLD ";
                  FLDTag += "NAME=\"" + tData + "\"" + " TYPE=\"" + this.dataType[tData] + "\">" + tab[tData] + "</FLD>";
                }
              }
              LINTag += ">" + FLDTag + "\n\t\t" + "</LIN>";
            }
            TABTag += ">" + LINTag + "\n\t</TAB>";
          }
        }
        return RESULTTAG + TABTag + "\n</" + result + ">";
      }
    }
  }

  callSoapRequest() {
    this.soap.createClient('assets/delivery.wsdl', {
      attributesKey: 'attributes', valueKey: '$value', xmlKey: '$xml'
    })
      .then(client => {
        client.setSecurity(new security.BasicAuthSecurity(environment.soapUsername, environment.soapPassword, ''))

        client.call('run', {
          callContext: {
            $xml: callcontent,
            attributes: {
              'xsi:type': 'wss:CAdxCallContext'
            },
          },
          publicName: {
            attributes: {
              'xsi:type': "xsd:string"
            },
            $value: 'X10ACONFIG'
          },
          inputXml: {
            attributes: {
              'xsi:type': "xsd:string"
            },
            $xml: value
          }
        }).subscribe(res => {
          // client.call('run', body).subscribe(res => {
          // }).subscribe(res => {
        }, err => console.log(err));
      })
      .catch(err => console.log(err));
  }

  onSubmit(form) {
    this.submitted = true;
    if (form.valid) {
      this.navCtrl.back();
    }
  }
}
