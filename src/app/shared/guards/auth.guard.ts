import { Events } from "./../../services/events";
import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  public logedInUser;
  constructor(
    private router: Router,
    private events: Events,
    private _auth: AuthService
  ) { }
  canActivate() {
    try {
      const data = localStorage.getItem("podDriverId");
      if (data && data !== "null") {
        this.events.publish("user:login", true);
        return true;
      }
    } catch (err) {
      this.events.publish("user:logout", true);
      this.router.navigateByUrl("/login");
      return false;
    }
    this.events.publish("user:logout", true);
    this.router.navigateByUrl("/login");
    return false;
    // return true;
  }
}
