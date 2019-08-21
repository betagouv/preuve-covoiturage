import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import cloneDeep from 'lodash/cloneDeep';

import { ToastrService } from 'ngx-toastr';

import { TripService } from '~/modules/trip/services/trip.service';
import { Trip } from '~/core/entities/trip/trip';
import { TripClass } from '~/core/entities/trip/trip-class';
import { TripStatus } from '~/core/entities/trip/trip-status';
import { TripInterface } from '~/core/interfaces/trip/tripInterface';
import { FilterService } from '~/core/services/filter.service';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';

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
    const randomClass = Math.floor(Math.random() * Object.keys(TripClass).length);
    const randomStatus = Math.floor(Math.random() * Object.keys(TripStatus).length);

    const tripToReturn: TripInterface = {
      _id: 'AZFAFZAF34345345',
      class: TripClass[Object.keys(TripClass)[randomClass]],
      start: new Date(),
      status: TripStatus[Object.keys(TripStatus)[randomStatus]],
      campaigns: [],
      people: [],
    };

    const nbCampaigns = Math.floor(Math.random() * 10);
    for (let i = 0; i < nbCampaigns; i = i + 1) {
      tripToReturn.campaigns.push({ name: `Campagne n°${i}` });
    }

    return new Trip(tripToReturn);
  }
}
