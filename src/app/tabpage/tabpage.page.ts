import { Component, OnInit } from '@angular/core';
import { Events } from '../services/events';

@Component({
  selector: 'app-tabpage',
  templateUrl: './tabpage.page.html',
  styleUrls: ['./tabpage.page.scss'],
})
export class TabPage implements OnInit {
  routeId = null;
  constructor(
    public events: Events,
  ) {
    this.events.subscribe("routeId:change", (id) => {
      this.routeId = id;
    });
  }

  ngOnInit() {
  }
}
