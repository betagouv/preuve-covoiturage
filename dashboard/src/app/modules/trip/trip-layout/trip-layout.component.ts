import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

import { MenuTabInterface } from '~/core/interfaces/admin/adminLayoutInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

@Component({
  selector: 'app-trip-layout',
  templateUrl: './trip-layout.component.html',
  styleUrls: ['./trip-layout.component.scss'],
})
export class TripLayoutComponent implements OnInit {
  public filterNumber = '';
  public showFilter = false;

  public menu: MenuTabInterface[];

  constructor(
    public authenticationService: AuthenticationService,
    public router: Router,
    protected sanitizer: DomSanitizer,
  ) {}

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
  }

  get hasCorrectUrl(): boolean {
    return !['/trip/import'].includes(this.router.url);
  }

  public setFilterNumber(filterNumber: number) {
    this.filterNumber = filterNumber === 0 ? '' : filterNumber.toString();
  }

  public toggleFilterDisplay(): void {
    this.showFilter = !this.showFilter;
  }
}
