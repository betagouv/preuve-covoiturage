import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {LoggerService} from './applicativeService/logger/service';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private loaded = false;
  private hideLoader = false;
  private hideHeader = true;
  private smallLoader = true;
  private refreshed = false;
  constructor(
      private router: Router,
      private loggerService: LoggerService,
  ) {

    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.refreshed) {
          this.initLoader();
        }
        this.hideLoaderFunction();
      }
    });
  }

  initLoader(size: string = null) {
    this.loaded = false;
    this.hideLoader = false;
    if (this.refreshed) {
      this.smallLoader = true;
    }
  }

  ngOnInit() {
    this.hideLoaderFunction();
    if ( !localStorage.getItem('cookieseen')) {
      // MessageService.cookie();
    }
  }
  hideLoaderFunction() {
    if (false === this.loaded) {
      setTimeout(() => {
        this.loaded = true;
        this.hideHeader = false;
        setTimeout(() => {
          this.hideLoader = true;
          this.refreshed = true;
        }, 1000);
      }, 1000);

    }
  }
}
