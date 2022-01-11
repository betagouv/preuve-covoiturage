import { takeUntil } from 'rxjs/operators';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '~/core/entities/authentication/user';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { CommonDataService } from '~/core/services/common-data.service';
import { AuthenticationService as Auth } from '~/core/services/authentication/authentication.service';
import { URLS } from '~/core/const/main.const';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends DestroyObservable implements OnInit {
  public user: User;
  public userMeta: string | null;

  get campaignLink(): string {
    return this.hasTerritoryGroup ? '/campaign' : '/campaign/list';
  }

  get hasTerritoryGroup(): boolean {
    return this.auth.isTerritory();
  }

  get hasRegistryGroup(): boolean {
    return this.auth.isRegistry();
  }

  constructor(public router: Router, public auth: Auth, private commonDataService: CommonDataService) {
    super();
  }

  ngOnInit(): void {
    this.auth.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
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
  }

  public setUserIcon(): string {
    if (!this.user) return '';
    else if (this.hasTerritoryGroup) return 'public';
    else if (this.hasRegistryGroup) return 'local_police';
    return 'directions_car';
  }

  public getDocURL(): string {
    return this.auth && this.auth.isOperatorOrAdmin() ? URLS.technicalDoc : URLS.mainDoc;
  }
}
