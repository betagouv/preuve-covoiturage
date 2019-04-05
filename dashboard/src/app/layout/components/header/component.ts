import { Component, Injectable, OnInit } from '@angular/core';

import { AuthenticationService } from '~/applicativeService/authentication/service';
import { Logged } from '~/applicativeService/authguard/logged';
import { TITLES } from '~/config/navbar';

@Component({
  selector: 'app-header',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})

@Injectable()
export class HeaderComponent implements OnInit {
  public logged: boolean;
  public title: string;
  public user: object;
  public company: object;

  constructor(
    private authenticationService: AuthenticationService,
  ) {
  }

  ngOnInit() {
    this.user = this.authenticationService.getUser();
    this.company = this.authenticationService.getCompany();
    this.setTitles();

    // observe 'logged' value
    Logged
      .get()
      .subscribe((logged: boolean) => {
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

  hasAnyGroup(groups: string[]) {
    const group = this.authenticationService.hasAnyGroup(groups);
    this.setTitles(group);
    return !!group;
  }
}
