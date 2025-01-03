import { ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { SwiperOptions } from 'swiper';
import { MAP_STYLES } from './map.model';
import { ActivatedRoute } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import { RoutesService } from 'src/app/services/routes.service';
import * as _ from 'lodash';
declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})

export class MapPage implements OnInit {
  @ViewChild(IonSlides, { static: false }) slides: IonSlides;
  infoWindow = new google.maps.InfoWindow();

  googleMap: any;
  index: number;
  directionsService: any;
  directionsDisplay: any;
  currentIndex: number;
  currentEvent;
  routeId: string;

  stops = [];

  swiperParams: SwiperOptions = {
    slidesPerView: 1,
    initialSlide: 0,
    // spaceBetween: 2
  }

  constructor(
    private route: ActivatedRoute,
    private utilService: UtilService,
    private routesService: RoutesService,
  ) {
    this.route.queryParams.subscribe(params => {
      if (params && params.route) {
        this.routeId = params.route;
      } else {
        const routeId = localStorage.getItem('activeRouteId');
        if (routeId !== 'null') {
          this.routeId = routeId;
        }
      }
    });
  }

  ionViewWillEnter() {
    setTimeout(() => {
      this.initMap(null);
    }, 1000);
    // navigator.geolocation.getCurrentPosition(
    //   (position: any) => {
    //     this.initMap({
    //       latitude: position.coords.latitude,
    //       longitude: position.coords.longitude
    //     });
    //   }, () => {
    //     this.initMap(null);
    //   }, {
    //   enableHighAccuracy: true,
    //   timeout: 10000,
    //   maximumAge: 0
    // });
  }

  ngOnInit() {
  }

  async getStops() {
    await this.utilService.showLoading();
    this.routesService.getStops(this.routeId).subscribe((res: any) => {
      this.utilService.dismissLoading();
      this.stops = _.sortBy(res, ['XCSGNUM_0']);
      this.setMarker();
    }, (err: any) => {
      this.utilService.dismissLoading();
      this.utilService.showErrorCall(err);
    });
  }

  initMap(location) {
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
        center: location ? { lat: Number(location.latitude), lng: Number(location.longitude) } : { lat: 0, lng: 0 },
        styles: MAP_STYLES,
      });
    }


    if (this.routeId) {
      this.getStops();
    }
    // google.maps.event.addListenerOnce(this.googleMap, 'idle', () => {
    // })
  }

  setMarker() {
    const icon = {
      url: 'assets/images/pin.png',
      // size: new google.maps.Size(38, 38),
      // scaledSize: new google.maps.Size(38, 38),
      labelOrigin: new google.maps.Point(16, 12)
    };
    // const homeIcon= 'data:image/jpeg;base64,assets/icon/favicon.png';
    const homeIcon = 'assets/images/home.png';
    const homearker = new google.maps.Marker({
      position: { lat: Number(this.stops[0].X10A_FCYGEOY_0), lng: Number(this.stops[0].X10A_FCYGEOX_0) },
      map: this.googleMap,
      icon: homeIcon,
      label: {
        text: ' ',
        fontSize: "15px",
        fontWeight: "bold",
        color: '#ffffff',
      },
    });

    this.stops.map((mt, index) => {
      if (this.googleMap) {
        const marker = new google.maps.Marker({
          position: { lat: Number(mt.XX10A_BPGEOY_0), lng: Number(mt.XX10A_BPGEOX_0) },
          map: this.googleMap,
          icon: icon,
          label: {
            text: index + 1 + '',
            fontSize: "15px",
            fontWeight: "bold",
            color: '#ffffff',
          },
          title: mt.XBPNAME_0
        });

        marker.addListener("click", () => {
          this.slides.slideTo(index, 0);
          this.googleMap.setZoom(15);
          this.googleMap.setCenter(marker.getPosition());
          this.infoWindow.close();
          // marker.setIcon("assets/images/location-marker-change.png");
          this.infoWindow.setContent(marker.getTitle());
          this.infoWindow.open(marker.getMap(), marker);
        });
      }
      return mt;
    });

    if (this.stops && this.stops.length > 0) {
      if (this.stops.length === 1) {
        this.googleMap.setCenter({ lat: Number(this.stops[0].XX10A_BPGEOY_0), lng: Number(this.stops[0].XX10A_BPGEOX_0) });
      } else {
        this.stops[0].type = 'start';
        this.stops[this.stops.length - 1].type = 'end';
        // const start = _.find(this.stops, { type: 'start' });
        const start = this.stops[0];
        const end = _.find(this.stops, { type: 'end' })
        const waypoints = _.filter(this.stops, (task) => {
          return task.type !== 'end';
        }).map(task => {
          return { location: { lat: Number(task.XX10A_BPGEOY_0), lng: Number(task.XX10A_BPGEOX_0) } }
        });
        let request = {
          origin: { lat: Number(start.X10A_FCYGEOY_0), lng: Number(start.X10A_FCYGEOX_0) },
          waypoints,
          destination: { lat: Number(end.XX10A_BPGEOY_0), lng: Number(end.XX10A_BPGEOX_0) },
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

  async sliderChanges(event) {
    await this.slides.getActiveIndex().then(index => {
      this.currentIndex = index;
    });
    this.currentEvent = this.stops[this.currentIndex];
    // if (this.currentEvent) {
    //   this.marker.setIcon("assets/images/location-marker-change.png");
    // }
    this.googleMap.setCenter({ lat: Number(this.currentEvent.XX10A_BPGEOY_0), lng: Number(this.currentEvent?.XX10A_BPGEOX_0) });
  }
}
