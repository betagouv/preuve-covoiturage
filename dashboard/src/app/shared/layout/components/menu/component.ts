import { Component, Injectable, OnInit, ViewEncapsulation } from '@angular/core';

import { AuthenticationService } from '~/applicativeService/authentication/service';

import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-menu',
  template: '<p-menu [model]="items" id="mainMenu"></p-menu>',
  styleUrls: ['style.scss'],
  encapsulation: ViewEncapsulation.None,
})

@Injectable()
export class MenuComponent implements OnInit {
  items: any[];

  constructor(
    private authenticationService: AuthenticationService,
  ) {
  }

  ngOnInit() {
    this.items = [
      {
        label: 'GENERAL',
        items: [
          {
            label: 'Trajets', icon: 'pi pi-fw pi-share-alt', routerLink: '/dashboard/journeys', routerLinkActiveOptions: { exact: true },
            visible: true,
          },
          {
            label: 'Import', icon: 'pi pi-fw pi-upload', routerLink: '/dashboard/operators/journey-import', routerLinkActive: 'is-active',
            visible: this.hasAnyGroup(['operators']),
          },
          {
            label: 'Import', icon: 'pi pi-fw pi-upload', routerLink: '/dashboard/registry/journey-import', routerLinkActive: 'is-active',
            visible: this.hasAnyGroup(['registry']),
          },
          {
            label: 'Statistiques', icon: 'pi pi-fw pi-chart-bar', routerLink: '/dashboard/aoms/statistics', routerLinkActive: 'is-active',
            visible: this.hasAnyGroup(['aom']),
          },
        ],
      },
      {
        label: 'INCITATIONS',
        icon: 'pi pi-fw pi-briefcase',
        // hide for now in production and staging
        visible: (['dev', 'local', 'review'].indexOf(environment.name) > -1) && this.hasAnyGroup(['registry', 'aom']),
        items: [
          {
            label: 'Politiques', icon: 'pi pi-fw pi-copy', routerLink: '/dashboard/incentives/policies',
            routerLinkActive: 'is-active',
          },
          {
            label: 'Campagnes', icon: 'pi pi-fw pi-calendar',
            routerLink: '/dashboard/incentives/campaigns', routerLinkActive: 'is-active',
          },

        ],
      },
      {
        label: 'ADMINISTRATION',
        visible: this.hasAnyGroup(['registry', 'operators']),
        items: [
          {
            label: 'Tokens', icon: 'pi pi-fw pi-cog', routerLink: '/dashboard/operators/tokens', routerLinkActiveOptions: { exact: true },
            visible: this.hasAnyGroup(['operators']),
          },
          {
            label: 'Utilisateurs', icon: 'pi pi-fw pi-users', routerLink: '/dashboard/users/admin', routerLinkActive: 'is-active',
            visible: this.hasAnyGroup(['registry']),
          },
          {
            label: 'Opérateurs', icon: 'pi pi-fw pi-tablet', routerLink: '/dashboard/operators/admin', routerLinkActive: 'is-active',
            visible: this.hasAnyGroup(['registry']),
          },
          {
            label: 'AOMs', icon: 'pi pi-fw pi-home', routerLink: '/dashboard/aoms/admin', routerLinkActive: 'is-active',
            visible: this.hasAnyGroup(['registry']),
          },
        ],
      },
    ];
  }

  hasAnyGroup(groups: string[]) {
    const group = this.authenticationService.hasAnyGroup(groups);
    return !!group;
  }
}
