import { filter, takeUntil } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { URLS } from '~/core/const/main.const';
import { User } from '~/core/entities/authentication/user';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CommonDataService } from '~/core/services/common-data.service';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends DestroyObservable implements OnInit {
  public user: User;
  public userMeta: string | null;
  public homeLink = '/';

  get routerLink(): string {
    return this.hasTerritoryGroup ? '/campaign' : '/campaign/list';
  }

  get hasTerritoryGroup(): boolean {
    return this.authService.hasAnyGroup([UserGroupEnum.TERRITORY]);
  }

  get hasRegistryGroup(): boolean {
    return this.authService.hasAnyGroup([UserGroupEnum.REGISTRY]);
  }

  constructor(
    public router: Router,
    public authService: AuthenticationService,
    private commonDataService: CommonDataService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.authService.user$.subscribe((user) => {
      if (!user) return;
      this.user = user;

      /**
       * Get the name of the territory or operator
       * or tell the user she's an admin.
       */
      let meta$ = null;
      if (this.user.territory_id) {
        meta$ = this.commonDataService.currentTerritory$;
      } else if (this.user.operator_id) {
        meta$ = this.commonDataService.currentOperator$;
      } else {
        this.userMeta = 'admin';
      }

      if (meta$) {
        meta$.pipe(takeUntil(this.destroy$)).subscribe((entity) => {
          this.userMeta = entity && 'name' in entity ? entity.name : null;
        });
      }
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

  public setHomeLink(url: string): void {
    this.homeLink = url === '/stats' ? URLS.CMSLink : '/';
  }

  public onLogout(): void {
    this.authService.logout();
  }

  public setUserIcon(): string {
    if (!this.user) return '';
    else if (this.hasTerritoryGroup) return 'public';
    else if (this.hasRegistryGroup) return 'local_police';
    return 'directions_car';
  }
}
