import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

import { TripService } from '~/modules/trip/services/trip.service';
import { FilterService } from '~/modules/filter/services/filter.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';
import { DEFAULT_TRIP_LIMIT, DEFAULT_TRIP_SKIP, TRIP_SKIP_SCROLL } from '~/core/const/filter.const';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { LightTripInterface } from '~/core/interfaces/trip/tripInterface';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss'],
})
export class TripListComponent extends DestroyObservable implements OnInit {
  isExporting: boolean;
  trips: LightTripInterface[] = [];
  skip = DEFAULT_TRIP_SKIP;
  limit = DEFAULT_TRIP_LIMIT;

  constructor(
    public filterService: FilterService,
    public tripService: TripService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private authService: AuthenticationService,
  ) {
    super();
  }

  ngOnInit() {
    this.filterService.filter$.pipe(takeUntil(this.destroy$)).subscribe((filter: FilterInterface) => {
      // reset skip when new search
      this.skip = 0;
      this.loadTrips({
        ...filter,
        skip: 0,
        limit: this.limit,
      });
    });
  }

  get loading(): boolean {
    return this.tripService.loading;
  }

  get loaded(): boolean {
    return this.tripService.loading;
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

  onScroll() {
    // TODO stop fetching trips when end (count 0) is reached
    this.skip += TRIP_SKIP_SCROLL;
    const filter = {
      ...this.filterService.filter$.value,
      skip: this.skip,
      limit: this.limit,
    };
    this.loadTrips(filter, true);
  }

  exportTrips() {
    this.isExporting = true;
    this.tripService
      .exportTrips()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        () => {
          this.isExporting = false;
        },
        (err) => {
          this.isExporting = false;
          this.toastr.error(err.message);
        },
      );
  }

  private loadTrips(filter: FilterInterface | {} = {}, loadMore = false): void {
    const user = this.authService.user;
    if (this.tripService.loading) {
      return;
    }
    this.tripService
      .load(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (trips) => {
          this.trips = loadMore ? this.trips.concat(trips) : trips;
        },
        (err) => {
          this.toastr.error(err.message);
        },
      );
  }
}
