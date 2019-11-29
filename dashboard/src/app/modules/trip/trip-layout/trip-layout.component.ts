import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { filter, takeUntil } from 'rxjs/operators';

import { MenuTabInterface } from '~/core/interfaces/admin/adminLayoutInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { DestroyObservable } from '~/core/components/destroy-observable';

@Component({
  selector: 'app-trip-layout',
  templateUrl: './trip-layout.component.html',
  styleUrls: ['./trip-layout.component.scss'],
})
export class TripLayoutComponent extends DestroyObservable implements OnInit {
  public filterNumber = '';
  public showFilter = false;
  public pageHasFilter = false;

  public menu: MenuTabInterface[];

  constructor(
    public authenticationService: AuthenticationService,
    public router: Router,
    protected sanitizer: DomSanitizer,
  ) {
    super();
  }

  ngOnInit() {
    this.menu = [
      {
        path: '/trip/stats',
        label: 'Chiffres clés',
      },
      {
        path: '/trip/list',
        label: 'Liste détaillée',
      },
      {
        path: '/trip/export',
        groups: [UserGroupEnum.TERRITORY, UserGroupEnum.REGISTRY],
        label: 'Export',
      },
    ];
    // {
    //   path: '/trip/maps',
    //   groups: [UserGroupEnum.REGISTRY],
    //   label: 'Cartes',
    // },
    // {
    //   path: '/trip/import',
    //   groups: [UserGroupEnum.OPERATOR],
    //   label: 'Import',
    // },

    this.setShowFilter();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((event: NavigationEnd) => {
        this.setShowFilter(event.url);
      });
  }

  setShowFilter(url = this.router.url): void {
    this.pageHasFilter = !['/trip/import', '/trip/export'].includes(url);
  }

  public setFilterNumber(filterNumber: number) {
    this.filterNumber = filterNumber === 0 ? '' : filterNumber.toString();
  }

  public toggleFilterDisplay(): void {
    this.showFilter = !this.showFilter;
  }
}
