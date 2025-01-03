import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-route-settlement',
  templateUrl: './route-settlement.page.html',
  styleUrls: ['./route-settlement.page.scss'],
})
export class RouteSettlementPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }
  
  goTo(url){
    this.router.navigate([url]);
  }
}
