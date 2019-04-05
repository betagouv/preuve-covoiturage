import { Component, Injectable, OnInit, ViewEncapsulation } from '@angular/core';

import { AuthenticationService } from '~/applicativeService/authentication/service';

@Component({
  selector: 'app-menu',
  templateUrl: 'template.html',
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
            label: 'Import', icon: 'pi pi-fw pi-upload', routerLink: '/dashboard/operator/journey-import', routerLinkActive: 'is-active',
            visible: this.hasAnyGroup(['operators']),
          },
          {
            label: 'Import', icon: 'pi pi-fw pi-upload', routerLink: '/dashboard/registry/journey-import', routerLinkActive: 'is-active',
            visible: this.hasAnyGroup(['registry']),
          },
          {
            label: 'Statistiques', icon: 'pi pi-fw pi-chart-bar', routerLink: '/dashboard/aom/statistics', routerLinkActive: 'is-active',
            visible: this.hasAnyGroup(['aom']),
          },
        ],
      },
      {
        label: 'INCITATIONS',
        icon: 'pi pi-fw pi-briefcase',
        visible: this.hasAnyGroup(['hide']),
        items: [
          {
            label: 'Politiques', icon: 'pi pi-fw pi-copy', routerLink: '/dashboard/incentive-policies',
            routerLinkActive: 'is-active',
          },
          {
            label: 'Campagnes', icon: 'pi pi-fw pi-calendar',
            routerLink: '/dashboard/incentive-campaigns', routerLinkActive: 'is-active',
          },

        ],
      },
      {
        label: 'ADMINISTRATION',
        visible: this.hasAnyGroup(['registry', 'operators']),
        items: [
          {
            label: 'Tokens', icon: 'pi pi-fw pi-cog', routerLink: '/admin/tokens', routerLinkActiveOptions: { exact: true },
            visible: this.hasAnyGroup(['operators']),
          },
          {
            label: 'Utilisateurs', icon: 'pi pi-fw pi-users', routerLink: '/admin/users', routerLinkActive: 'is-active',
            visible: this.hasAnyGroup(['registry']),
          },
          {
            label: 'Opérateurs', icon: 'pi pi-fw pi-tablet', routerLink: '/admin/operators', routerLinkActive: 'is-active',
            visible: this.hasAnyGroup(['registry']),
          },
          {
            label: 'AOMs', icon: 'pi pi-fw pi-home', routerLink: '/admin/aoms', routerLinkActive: 'is-active',
            visible: this.hasAnyGroup(['registry']),
          },
        ],
      }];
  }

  hasAnyGroup(groups: string[]) {
    const group = this.authenticationService.hasAnyGroup(groups);
    return !!group;
  }
}
