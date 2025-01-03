import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventory-detail',
  templateUrl: './inventory-detail.component.html',
  styleUrls: ['./inventory-detail.component.scss'],
})
export class InventoryDetailComponent implements OnInit {

  constructor(private router: Router) { }


  ngOnInit() {}
  goTo(url){
    this.router.navigate([url]);
  }
}
