import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {
  payment_type = 'cash';
  isInput: boolean = false;
  constructor(private utilService: UtilService) { }

  ngOnInit() {
  }
  captureImage() {
    this.utilService.showImageActionSheet('', async result => {
      if (result) {
        this.utilService.pickCamera(result, async imageData => {
        });
      }
    })
  }

  onChange(ev) {
    this.payment_type = ev.target.value;
    this.isInput = false;
  }

  onKeyUp() {
    this.isInput = true;
  }
}
