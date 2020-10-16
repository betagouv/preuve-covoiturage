import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { FilterService } from '~/modules/filter/services/filter.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';
import { DEFAULT_TRIP_LIMIT, DEFAULT_TRIP_SKIP } from '~/core/const/filter.const';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { TripStoreService } from '~/modules/trip/services/trip-store.service';
import { LightTrip } from '~/core/entities/trip/trip';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss'],
})
export class TripListComponent extends DestroyObservable implements OnInit, AfterViewInit {
  trips: LightTrip[] = [];
  skip = DEFAULT_TRIP_SKIP;
  limit = DEFAULT_TRIP_LIMIT;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  protected _filter;

  constructor(
    public filterService: FilterService,
    public tripService: TripStoreService,
    private authService: AuthenticationService,
  ) {
    super();
  }
  ngAfterViewInit(): void {
    const filterLoad = (filter: FilterInterface) => {
      // // reset skip when new search
      this._filter = filter;
      this.skip = 0;
      this.loadTrips(
        {
          ...filter,
          skip: 0,
          limit: this.limit,
        },
        true,
      );

      this.paginator.pageIndex = 0;
    };
    this.filterService.filter$.pipe(takeUntil(this.destroy$)).subscribe(filterLoad);
    this.tripService.entities$.pipe(takeUntil(this.destroy$)).subscribe((trips) => (this.trips = trips));
  }

  ngOnInit(): void {}

  get columnsDisplayed(): string[] {
    const columns = ['startCity', 'endCity', 'date', 'campaigns', 'incentives', 'class', 'status'];
    if (this.authService.user && this.authService.user.group !== UserGroupEnum.OPERATOR) {
      columns.splice(5, 0, 'operator');
    }
    return columns;
  }

  get loading(): boolean {
    return this.tripService.isLoading;
  }

  get loaded(): boolean {
    return !!this.tripService.loaded;
  }

  /**
   * if no values in database when no filter is applied this should return true
   */
  get showMessage(): boolean {
    return !this.loading && this.loaded && !this.hasFilter && this.trips.length === 0;
  }

  get hasFilter(): boolean {
    return Object.keys(this.filterService.filter$.value).length > 0;
  }

  get total(): number {
    return this.tripService.total;
  }

  paginationUpdate(pageEvent: PageEvent): void {
    this.loadTrips(
      {
        ...this._filter,
        skip: pageEvent.pageIndex * pageEvent.pageSize,
        limit: pageEvent.pageSize,
      },
      false,
    );
  }

  // onScroll(): void {
  // this.skip += DEFAULT_TRIP_LIMIT;
  // const filter = {
  //   ...this.filterService.filter$.value,
  //   skip: this.skip,
  //   limit: this.limit,
  // };
  // this.loadTrips(filter, true);
  // }

  private loadTrips(filter: FilterInterface | {} = {}, refreshCount = false): void {
    // if (this.tripService.isLoading) {
    //   return;
    // }

    this.tripService.load(filter, refreshCount);
  }
}
