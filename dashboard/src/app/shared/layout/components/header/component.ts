import { Component, Injectable, OnInit } from '@angular/core';

import { AuthenticationService } from '~/applicativeService/authentication/auth.service';
import { Logged } from '~/applicativeService/authentication/logged';
import { TITLES } from '~/config/navbar';
import { OrganisationCompany } from '~/entities/database/organisationCompany';
import { User } from '~/entities/database/user/user';

@Component({
  selector: 'app-header',
  templateUrl: 'template.html',
  styleUrls: ['style.scss'],
})
@Injectable()
export class HeaderComponent implements OnInit {
  public logged: boolean;
  public title: string;
  public user: User;
  public company: OrganisationCompany;

  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit() {
    this.user = this.authenticationService.getUser();
    this.company = this.authenticationService.getCompany();
    this.setTitles();

    Logged.get().subscribe((logged: boolean) => {
      this.logged = logged;
    });
  }

  setTitles(group: string = null) {
    const groupToTitles = TITLES;
    this.title = groupToTitles[group] ? groupToTitles[group] : groupToTitles['default'];
  }

  logOut() {
    this.authenticationService.logout({ toLogin: true });
  }
}
