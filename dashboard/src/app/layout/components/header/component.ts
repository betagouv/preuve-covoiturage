import { Component , Injectable, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { componentFactoryName } from '@angular/compiler';

import { AuthenticationService } from '~/applicativeService/authentication/service';
import { Logged } from '~/applicativeService/authguard/logged';
import { TITLES } from '~/config/navbar';


@Component({
  selector : 'app-header',
  templateUrl : 'template.html',
  styleUrls : ['style.scss'],
})

@Injectable()
export class HeaderComponent implements OnInit {
  public navbarBurgerActive = false;
  public navbarMenuActive = false;
  public logged;
  public title = '';
  public subTitle = '';

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    // todo: optimize this, at the moment minor bug when click on desktop then narrow window
    document.getElementById('navbarBasicExample').onclick = (e) => { this.toggleMobileNav(); };
    this.setTitles();

    Logged.get().subscribe((logged: boolean) => {
      this.logged = logged;
    });
  }

  setTitles(group: string = null) {
    const groupToTitles = TITLES;
    this.title = (groupToTitles[group]) ? groupToTitles[group] : groupToTitles['default'];
  }

  logOut() {
    this.authenticationService.logout(true);
  }

  isActive(path) {
    return (path === this.router.url);
  }

  toggleMobileNav() {
    this.navbarBurgerActive = !this.navbarBurgerActive;
    this.navbarMenuActive = !this.navbarMenuActive;
  }

  hasAnyGroup(groups: string[]) {
    const group = this.authenticationService.hasAnyGroup(groups);
    this.setTitles(group);
    return !!group;
  }
}
