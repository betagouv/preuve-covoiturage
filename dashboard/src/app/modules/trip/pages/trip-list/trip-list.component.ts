import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

import { FilterService } from '~/modules/filter/services/filter.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';
import { DEFAULT_TRIP_LIMIT, DEFAULT_TRIP_SKIP } from '~/core/const/filter.const';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { TripStoreService } from '~/modules/trip/services/trip-store.service';
import { LightTrip } from '~/core/entities/trip/trip';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss'],
})
export class TripListComponent extends DestroyObservable implements OnInit {
  trips: LightTrip[] = [];
  skip = DEFAULT_TRIP_SKIP;
  limit = DEFAULT_TRIP_LIMIT;

  constructor(
    public filterService: FilterService,
    public tripService: TripStoreService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private authService: AuthenticationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.filterService.filter$.pipe(takeUntil(this.destroy$)).subscribe((filter: FilterInterface) => {
      // reset skip when new search
      this.skip = 0;
      this.loadTrips({
        ...filter,
        skip: 0,
        limit: this.limit,
      });
    });
    this.tripService.entities$.pipe(takeUntil(this.destroy$)).subscribe((trips) => (this.trips = trips));
  }

  get columnsDisplayed(): string[] {
    const columns = ['startCity', 'endCity', 'date', 'campaigns', 'incentives', 'class', 'status'];
    if (this.authService.user.group !== UserGroupEnum.OPERATOR) {
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

  onScroll(): void {
    this.skip += DEFAULT_TRIP_LIMIT;
    const filter = {
      ...this.filterService.filter$.value,
      skip: this.skip,
      limit: this.limit,
    };
    this.loadTrips(filter, true);
  }

  private loadTrips(filter: FilterInterface | {} = {}, loadMore = false): void {
    if (this.tripService.isLoading) {
      return;
    }

    this.tripService.load(filter);
  }
}
