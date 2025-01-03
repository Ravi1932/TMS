import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-close-stock',
  templateUrl: './close-stock.component.html',
  styleUrls: ['./close-stock.component.scss'],
})
export class CloseStockComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() { }
  goTo(url) {
    this.router.navigate([url]);
  }
}
