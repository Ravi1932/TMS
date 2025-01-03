import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-open-stock',
  templateUrl: './open-stock.component.html',
  styleUrls: ['./open-stock.component.scss'],
})
export class OpenStockComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {}
  goTo(url){
    this.router.navigate([url]);
  }
}
