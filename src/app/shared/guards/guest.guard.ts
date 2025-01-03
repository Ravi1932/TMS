import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Events } from 'src/app/services/events';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(private events: Events, private router: Router) { }
  canActivate() {
    try {
      let data;
      data = localStorage.getItem('podDriverId');
      if (data && data !== "null") {
        this.events.publish("user:login", true);
        this.router.navigate(['/tabs/routes'], { queryParams: { code: data } });
        return false;
      }
    } catch (err) {
      this.events.publish("user:logout", true);
      return true;
    }
    this.events.publish("user:logout", true);
    return true;
  }
}
