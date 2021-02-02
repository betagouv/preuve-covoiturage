import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { filter, takeUntil, map } from 'rxjs/operators';

import { MenuTabInterface } from '~/core/interfaces/admin/adminLayoutInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-trip-layout',
  templateUrl: './trip-layout.component.html',
  styleUrls: ['./trip-layout.component.scss'],
})
export class TripLayoutComponent extends DestroyObservable implements OnInit {
  public menu: MenuTabInterface[] = [
    {
      path: '/trip/stats',
      label: 'Chiffres clés',
    },
    {
      path: '/trip/list',
      label: 'Liste détaillée',
    },
  ];

  public filtersCount = '';
  public showFilters = false;
  public pageHasFilters = false;
  public canExport$: Observable<boolean>;

  constructor(
    public authenticationService: AuthenticationService,
    public router: Router,
    protected sanitizer: DomSanitizer,
  ) {
    super();
  }

  ngOnInit(): void {
    this.canExport$ = this.authenticationService.user$.pipe(
      takeUntil(this.destroy$),
      map(() =>
        this.authenticationService.hasAnyPermission([
          'trip.export',
          'operator.trip.export',
          'territory.trip.export',
        ] as any),
      ),
    );

    // check on init and page change
    this.enableFiltersOnPage();
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$),
      )
      .subscribe((event: NavigationEnd) => {
        this.enableFiltersOnPage(event.url);
      });
  }

  public enableFiltersOnPage(url = this.router.url): void {
    this.pageHasFilters = !['/trip/import', '/trip/export'].includes(url);
  }

  public setFiltersCount(count: number): void {
    this.filtersCount = count === 0 ? '' : count.toString();
  }

  public toggleFilterDisplay(): void {
    this.showFilters = !this.showFilters;
  }

  public hasGroupAndRole(groups, role): boolean {
    return this.authenticationService.hasAnyGroup(groups) && this.authenticationService.hasRole(role);
  }
}
