import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import cloneDeep from 'lodash/cloneDeep';
import { ToastrService } from 'ngx-toastr';
import { takeUntil } from 'rxjs/operators';

import { TripService } from '~/modules/trip/services/trip.service';
import { Trip } from '~/core/entities/trip/trip';
import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { TripInterface } from '~/core/interfaces/trip/tripInterface';
import { FilterService } from '~/core/services/filter.service';
import { FilterUxInterface } from '~/core/interfaces/filter/filterUxInterface';
import { campaignMocks } from '~/modules/campaign/mocks/campaigns';
import { DestroyObservable } from '~/core/components/destroy-observable';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { UserService } from '~/core/services/authentication/user.service';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss'],
})
export class TripListComponent extends DestroyObservable implements OnInit {
  isExporting: boolean;
  trips: Trip[] = [];

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
      this.loadTrips(filter);
    });
  }

  onScroll() {
    this.loadTrips();
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

  private loadTrips(filter: FilterInterface | {} = {}): void {
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
          this.trips = trips;
        },
        (err) => {
          this.toastr.error(err.message);

          // TODO TMP TO DELETE
          for (let i = 0; i < 20; i = i + 1) {
            this.trips.push(this.generateTrip());
          }
          this.trips = cloneDeep(this.trips);
          this.cd.detectChanges();
        },
      );
  }

  // TODO TMP TO DELETE
  private generateTrip(): Trip {
    const randomClass = Math.floor(Math.random() * Object.keys(TripRankEnum).length);
    const randomStatus = Math.floor(Math.random() * Object.keys(TripStatusEnum).length);

    const tripToReturn: TripInterface = {
      _id: 'AZFAFZAF34345345',
      class: TripRankEnum[Object.keys(TripRankEnum)[randomClass]],
      start: new Date(),
      status: TripStatusEnum[Object.keys(TripStatusEnum)[randomStatus]],
      campaigns: [],
      people: [],
    };

    const nbPeople = Math.floor(Math.random() * 5);
    for (let i = 0; i <= nbPeople; i = i + 1) {
      this.generatePeople(tripToReturn, i);
    }

    const nbCampaigns = Math.floor(Math.random() * 10);
    tripToReturn.campaigns = tripToReturn.campaigns.concat([...campaignMocks].splice(0, nbCampaigns));

    return new Trip(tripToReturn);
  }

  generatePeople(trip, i) {
    trip.people.push({
      class: TripRankEnum.A,
      operator: {
        _id: '1',
        nom_commercial: 'Batcovoit 🦇',
      },
      is_driver: i === 0,
      start: 'Metropolis',
      end: 'Gotham city',
      incentives: [
        {
          amount: Math.floor(Math.random() * 10),
          amount_unit: ['eur', 'point'][Math.floor(Math.random() * 2)],
        },
      ],
    });
  }
}
