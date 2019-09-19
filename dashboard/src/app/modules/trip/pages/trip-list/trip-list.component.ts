import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import cloneDeep from 'lodash/cloneDeep';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

import { TripService } from '~/modules/trip/services/trip.service';
import { Trip } from '~/core/entities/trip/trip';
import { FilterService } from '~/core/services/filter.service';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { UserService } from '~/core/services/authentication/user.service';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss'],
})
export class TripListComponent extends DestroyObservable implements OnInit {
  isExporting: boolean;
  trips: Trip[] = [];
  skip = 0;
  limit = 50;

  constructor(
    public filterService: FilterService,
    public tripService: TripService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private userService: UserService,
  ) {
    super();
  }

  ngOnInit() {
    this.filterService._filter$.pipe(takeUntil(this.destroy$)).subscribe((filter: FilterInterface) => {
      this.loadTrips({
        ...filter,
        skip: this.skip,
        limit: this.limit,
      });
    });
  }

  onScroll() {
    // TODO stop fetching trips when end (count 0) is reached
    this.skip += 20;
    const filter = {
      ...this.filterService._filter$.value,
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
    if (this.tripService.loading) {
      return;
    }
    if (this.userService.user.group === UserGroupEnum.TERRITORY) {
      filter['territory_id'] = [this.userService.user.territory];
    }
    // TODO: temp, remove when filter operator added
    if ('operator_id' in filter) {
      delete filter.operator_id;
    }
    this.tripService
      .load(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (trips) => {
          if (loadMore) {
            this.trips = this.trips.concat(trips);
          } else {
            this.trips = trips;
          }
        },
        (err) => {
          this.toastr.error(err.message);
        },
      );
  }
}
