import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Events } from 'src/app/services/events';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  login = { driverId: '', password: '', lang: 'en' };
  submitted = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private events: Events
  ) {
    if (localStorage.getItem('language')) {
      this.login.lang = localStorage.getItem('language');
    }
  }

  ngOnInit() {
  }

  onLogin(form) {
    this.submitted = true;
    if (form.valid) {
      localStorage.setItem('language', this.login.lang);
      this.authService.login(this.login);
    }
  }
  languageChange(lang: any) {
    this.login.lang = lang;
    localStorage.setItem('language', this.login.lang);
    this.events.publish("language:changed", true);
  }
}
