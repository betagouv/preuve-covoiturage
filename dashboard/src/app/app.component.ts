import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

import { LoggerService } from './applicativeService/logger/service';
import { Logged } from './applicativeService/authguard/logged';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public loaded = false;
  public hideLoader = false;
  public hideHeader = true;
  public smallLoader = true;
  public logged = false;
  constructor(
      private router: Router,
      private loggerService: LoggerService,
  ) {
  }

  ngOnInit() {
    if (!localStorage.getItem('cookieseen')) {
      // MessageService.cookie();
    }
  }
}
