import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import cloneDeep from 'lodash/cloneDeep';

import { ToastrService } from 'ngx-toastr';

import { TripService } from '~/modules/trip/services/trip.service';
import { Trip } from '~/core/entities/trip/trip';
import { TripClass } from '~/core/entities/trip/trip-class';
import { TripStatus } from '~/core/entities/trip/trip-status';
import { Person } from '~/core/entities/trip/person';

@Component({
  selector: 'app-trip-list',
  templateUrl: './trip-list.component.html',
  styleUrls: ['./trip-list.component.scss'],
})
export class TripListComponent implements OnInit {
  isExporting: boolean;
  trips: Trip[] = [];

  constructor(public tripService: TripService, private toastr: ToastrService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadTrips();
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

  private loadTrips(): void {
    if (this.tripService.loading) {
      return;
    }
    this.tripService.load().subscribe(
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
    const tripToReturn = new Trip();
    const randomClass = Math.floor(Math.random() * Object.keys(TripClass).length);
    tripToReturn.class = TripClass[Object.keys(TripClass)[randomClass]];
    tripToReturn.start = new Date();
    const randomStatus = Math.floor(Math.random() * Object.keys(TripStatus).length);
    tripToReturn.status = TripStatus[Object.keys(TripStatus)[randomStatus]];
    tripToReturn.campaigns = [];

    const nbCampaigns = Math.floor(Math.random() * 10);
    for (let i = 0; i < nbCampaigns; i = i + 1) {
      tripToReturn.campaigns.push({ name: `Campagne n°${i}` });
    }

    return tripToReturn;
  }
}
