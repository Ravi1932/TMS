import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-add-signature',
  templateUrl: './add-signature.page.html',
  styleUrls: ['./add-signature.page.scss'],
})
export class AddSignaturePage implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true }) signaturePadElement: any;
  signaturePad: any;
  canvasWidth: number;
  canvasHeight: number;
  signPageData;
  showError = false;
  showErr = false;
  constructor(
    private elementRef: ElementRef,
    private modalController: ModalController,
    private params: NavParams
  ) {
    this.signPageData = params.get('signPageData');
  }

  ngOnInit() {
    this.init();
    this.signPageData = {
      rating: 0
    };
  }

  validateInput(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const inputValue = input.value.trim();
    if (inputValue.includes('-') || inputValue.includes('.')) {
      this.showError = true;
    } else {
      this.showError = isNaN(parseInt(inputValue, 10)) || parseInt(inputValue, 10) <= 0;
    }
  }

  validateIn() {
    if (this.signPageData.minutes !== null && this.signPageData.minutes <= 0) {
      this.showErr = true;
    } else {
      this.showErr = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.init();
  }

  init() {
    const canvas: any = this.elementRef.nativeElement.querySelector('canvas');
    canvas.width = window.innerWidth;
    canvas.height = 300;
    // canvas.height = window.innerHeight - 140;
    if (this.signaturePad) {
      this.signaturePad.clear(); // Clear the pad on init
    }
  }

  public ngAfterViewInit(): void {
    this.signaturePad = new SignaturePad(this.signaturePadElement.nativeElement);
    this.signaturePad.clear();
    this.signaturePad.backgroundColor = 'rgb(255,255,255)';
    this.signaturePad.penColor = 'rgb(18,110,130)';
  }

  save(): void {
    const canvas = this.signaturePad.canvas;
    const ctx = canvas.getContext('2d'); 

    const signData = this.signaturePad.toDataURL();

    ctx.fillStyle = '#ffffff'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src = signData;
    img.onload = () => {
        ctx.drawImage(img, 0, 0);
        this.signPageData.signature = canvas.toDataURL();
        this.modalController.dismiss(this.signPageData);
    };
    // this.signPageData.signature = this.signaturePad.toDataURL();
    // this.modalController.dismiss(this.signPageData);
  }

  setRating(event: MouseEvent): void {
    const target = event.target as HTMLInputElement;
    if (target.tagName === 'INPUT') {
      this.signPageData.rating = parseInt(target.value, 10);
    }
  }
  
  isCanvasBlank(): boolean {
    if (this.signaturePad) {
      return this.signaturePad.isEmpty() ? true : false;
    } else {
      return true;
    }
  }

  clear() {
    this.signaturePad.clear();
  }

  undo() {
    const data = this.signaturePad.toData();
    if (data) {
      data.pop(); // remove the last dot or line
      this.signaturePad.fromData(data);
    }
  }

  onRatingChange(rate) {
    this.signPageData.rating = rate;
  }

  closeModal() {
    this.modalController.dismiss(this.signPageData);
  }
}
