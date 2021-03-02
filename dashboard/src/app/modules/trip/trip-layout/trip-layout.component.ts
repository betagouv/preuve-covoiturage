import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { filter, takeUntil } from 'rxjs/operators';

import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { Roles } from '~/core/enums/user/roles';

@Component({
  selector: 'app-trip-layout',
  templateUrl: './trip-layout.component.html',
  styleUrls: ['./trip-layout.component.scss'],
})
export class TripLayoutComponent extends DestroyObservable implements OnInit {
  public filtersCount = '';
  public showFilters = false;
  public pageHasFilters = false;

  get canExport(): boolean {
    return !this.auth.hasRole(Roles.TerritoryDemo);
  }

  constructor(public auth: AuthenticationService, public router: Router, protected sanitizer: DomSanitizer) {
    super();
  }

  ngOnInit(): void {
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

  // TODO CHECK THIS
  public enableFiltersOnPage(url = this.router.url): void {
    this.pageHasFilters = !['/trip/import', '/trip/export'].includes(url);
  }

  public setFiltersCount(count: number): void {
    this.filtersCount = count === 0 ? '' : count.toString();
  }

  public toggleFilterDisplay(): void {
    this.showFilters = !this.showFilters;
  }

  public hasRole(role): boolean {
    return this.auth.hasRole(role);
  }
}
