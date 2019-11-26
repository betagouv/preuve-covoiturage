import { Component, OnInit } from '@angular/core';
import { filter, takeUntil } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';

import { User } from '~/core/entities/authentication/user';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { URLS } from '~/core/const/main.const';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends DestroyObservable implements OnInit {
  user: User;
  homeLink = '/';

  constructor(public authService: AuthenticationService, private router: Router) {
    super();
  }

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      this.user = user;
    });

    // go back to cms page when logo clicked on public stat page
    this.setHomeLink(this.router.url);
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((event: NavigationEnd) => {
        this.setHomeLink(event.url);
      });
  }

  setHomeLink(url: string) {
    this.homeLink = url === '/stats' ? URLS.mainSiteLink : '/';
  }

  onLogout(): void {
    this.authService.logout();
  }

  get hasTerritoryGroup(): boolean {
    return this.authService.hasAnyGroup([UserGroupEnum.TERRITORY]);
  }
}
