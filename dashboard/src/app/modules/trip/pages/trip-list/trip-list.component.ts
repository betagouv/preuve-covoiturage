import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import cloneDeep from 'lodash/cloneDeep';

import { ToastrService } from 'ngx-toastr';

import { TripService } from '~/modules/trip/services/trip.service';
import { Trip } from '~/core/entities/trip/trip';
import { TripClassEnum } from '~/core/enums/trip/trip-class.enum';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { TripInterface } from '~/core/interfaces/trip/tripInterface';
import { FilterService } from '~/core/services/filter.service';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';
import { campaignMocks } from '~/modules/campaign/mocks/campaigns';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss'],
})
export class TripListComponent implements OnInit {
  isExporting: boolean;
  trips: Trip[] = [];

  constructor(
    public filterService: FilterService,
    public tripService: TripService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.filterService._filter$.subscribe((filter: FilterInterface) => {
      this.loadTrips(filter);
    });
  }

  onScroll() {
    this.loadTrips();
  }

  exportTrips() {
    this.isExporting = true;
    this.tripService.exportTrips().subscribe(
      () => {
        this.isExporting = false;
      },
      (err) => {
        this.isExporting = false;
        this.toastr.error(err.message);
      },
    );
  }

  private loadTrips(filter: FilterInterface = {}): void {
    if (this.tripService.loading) {
      return;
    }
    this.tripService.load(filter).subscribe(
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
    const randomClass = Math.floor(Math.random() * Object.keys(TripClassEnum).length);
    const randomStatus = Math.floor(Math.random() * Object.keys(TripStatusEnum).length);

    const tripToReturn: TripInterface = {
      _id: 'AZFAFZAF34345345',
      class: TripClassEnum[Object.keys(TripClassEnum)[randomClass]],
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
      class: TripClassEnum.A,
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
