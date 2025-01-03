import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UtilService } from '../services/util.service';
import { MAP_STYLES } from '../tabpage/map/map.model';
import * as moment from 'moment';
import { RoutesService } from '../services/routes.service';
declare var google: any;

@Component({
  selector: 'app-ors',
  templateUrl: './ors.page.html',
  styleUrls: ['./ors.page.scss'],
})
export class OrsPage implements OnInit {
  orsResult: any;
  googleMap: any;
  directionsService: any;
  directionsDisplay: any;

  constructor(
    private http: HttpClient,
    private utilService: UtilService,
    private routeService: RoutesService
  ) { }

  ngOnInit() {
    this.initMap();
  }

  initMap() {
    this.directionsService = new google.maps.DirectionsService({
      optimizeWaypoints: true
    });
    this.directionsDisplay = new google.maps.DirectionsRenderer({
      polylineOptions: {
        strokeColor: "#009e71",
        strokeWeight: 7,
      }
    });

    if (!this.googleMap) {
      this.googleMap = new google.maps.Map(document.getElementById('map_canvas'), {
        mapTypeControl: false,
        streetViewControl: false,
        zoom: 10,
        center: { lat: 21.1702, lng: 72.8311 },
        styles: MAP_STYLES,
      });
    }
  }

  async getRoute() {
    await this.utilService.showLoading();
    this.routeService.oprimizeRoute().subscribe((res: any) => {
      this.utilService.dismissLoading();
      if (res && res.code == 0) {
        this.orsResult = res;
        this.setMarker();
      } else {
        this.utilService.showErrorCall(res);
      }
    }, (err: any) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    });
  }

  setMarker() {
    const icon = {
      url: 'assets/images/pin.png',
      labelOrigin: new google.maps.Point(16, 12)
    };
    const homeIcon = 'assets/images/home.png';
    const stops = this.orsResult.routes[0].steps;
    const homearker = new google.maps.Marker({
      position: { lat: Number(stops[0].location[1]), lng: Number(stops[0].location[0]) },
      map: this.googleMap,
      icon: homeIcon,
      label: {
        text: ' ',
        fontSize: "15px",
        fontWeight: "bold",
        color: '#ffffff',
      },
    });

    const homeInfoWindow = new google.maps.InfoWindow();
    homeInfoWindow.setContent(
      '<b>Start : ' + moment(new Date(stops[0].arrival * 1000)).format('DD/MM/YYYY hh:mm A') + '</b><br>' +
      '<b>End : ' + moment(new Date(stops[stops.length - 1].arrival * 1000)).format('DD/MM/YYYY hh:mm A') + '</b>'
    );
    homeInfoWindow.open(homearker.getMap(), homearker);

    stops.map((mt, index) => {
      if (this.googleMap && index != stops.length - 1 && index != 0) {
        const marker = new google.maps.Marker({
          position: { lat: Number(mt.location[1]), lng: Number(mt.location[0]) },
          map: this.googleMap,
          icon: icon,
          label: {
            text: index + '',
            fontSize: "15px",
            fontWeight: "bold",
            color: '#ffffff',
          },
          title: mt.XBPNAME_0
        });

        const infoWindow = new google.maps.InfoWindow();
        infoWindow.setContent(
          '<b>Doc Id: ' + mt.id + '</b><br>' +
          '<b>Customer: John Doe</b><br>' +
          '<b>Type: ' + mt.type + '</b><br>' +
          '<b>Arrival : ' + moment(new Date(mt.arrival * 1000)).format('DD/MM/YYYY hh:mm A') + '</b><br>' +
          '<b>Service Time: ' + ((mt.service / 60) | 0) + ' min</b><br>' +
          '<b>Departure : ' + moment(new Date((mt.arrival + mt.service) * 1000)).format('DD/MM/YYYY hh:mm A') + '</b><br>'
        );
        infoWindow.open(marker.getMap(), marker);
      }
      return mt;
    });

    if (stops && stops.length > 0) {
      const start = stops[0];
      const end = stops[stops.length - 1];
      const waypoints = [];
      for (let i = 1; i < stops.length - 1; i++) {
        waypoints.push({
          location: { lat: stops[i].location[1], lng: stops[i].location[0] }
        });
      }
      let request = {
        origin: { lat: Number(start.location[1]), lng: Number(start.location[0]) },
        waypoints,
        destination: { lat: Number(end.location[1]), lng: Number(end.location[0]) },
        travelMode: google.maps.DirectionsTravelMode.DRIVING
      }
      this.directionsService.route(request, (response, status) => {
        if (status == google.maps.DirectionsStatus.OK) {
          this.directionsDisplay.setDirections(response);
          this.directionsDisplay.setMap(this.googleMap);
          this.directionsDisplay.setOptions({ suppressMarkers: true });
        }
      });
    }
  }
}
