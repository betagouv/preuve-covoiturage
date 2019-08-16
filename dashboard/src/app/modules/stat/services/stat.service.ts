import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { get } from 'lodash';
import * as moment from 'moment';

import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { Stat } from '~/core/entities/stat/stat';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { FormatedStatInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';

import { co2Factor, petrolFactor } from '../config/stat';

@Injectable({
  providedIn: 'root',
})
export class StatService {
  public _formatedStat$ = new BehaviorSubject<FormatedStatInterface>(null);
  protected _loaded$ = new BehaviorSubject<boolean>(false);
  protected _loading$ = new BehaviorSubject<boolean>(false);

  constructor(private _http: HttpClient, private _jsonRPC: JsonRPCService) {}

  public load(filter: FilterInterface = {}): Observable<Stat[]> {
    this._loading$.next(true);
    const jsonRPCParam = new JsonRPCParam(`stat.list`, filter);
    return this._jsonRPC.call(jsonRPCParam).pipe(
      tap((data) => {
        this.formatData(data);
      }),
    );
  }

  get loading(): boolean {
    return this._loading$.value;
  }

  get stat(): FormatedStatInterface {
    return this._formatedStat$.value;
  }

  get stat$(): Observable<FormatedStatInterface> {
    return this._formatedStat$;
  }

  formatData(d: Stat | null) {
    if (!d || !d.trips || !d.distance || !d.carpoolers_per_vehicule || !d.carpoolers) return;

    const formatedStat = <FormatedStatInterface>{
      total: {
        trips: get(d, 'trips.total', 0),
        // tslint:disable-next-line:no-bitwise
        distance: (get(d, 'distance.total', 0) / 1000) | 0,
        carpoolers: get(d, 'carpoolers.total', 0),
        // tslint:disable-next-line:no-bitwise
        petrol: (get(d, 'distance.total', 0) * petrolFactor) | 0,
        // tslint:disable-next-line:no-bitwise
        co2: (get(d, 'distance.total', 0) * co2Factor) | 0,
        // tslint:disable-next-line:no-bitwise
        carpoolersPerVehicule: get(d, 'carpoolers_per_vehicule.total', 0),
        operators: get(d, 'operators.total', 0),
      },
      graph: {
        tripsPerMonth: {
          x: get(d, 'trips.months', []).map((val) => this.formatDate(val.date)),
          y: get(d, 'trips.months', []).map((val) => val.total),
        },
        tripsPerDay: {
          x: get(d, 'trips.days', [])
            .filter(this.filterLastWeek)
            .map((val) => this.formatDate(val.date)),
          y: get(d, 'trips.days', [])
            .filter(this.filterLastWeek)
            .map((val) => val.total),
        },
        tripsPerDayCumulated: {
          x: get(d, 'trips.days', []).map((val) => this.formatDate(val.date)),
          y: get(d, 'trips.days', []).reduce(this.reduceCumulativeData, []),
        },
        tripsSubsidizedPerMonth: {
          x: get(d, 'trips.months', []).map((val) => this.formatDate(val.date)),
          y: get(d, 'trips.months', []).map((val) => val.total_subsidized),
        },
        tripsSubsidizedPerDay: {
          x: get(d, 'trips.days', [])
            .filter(this.filterLastWeek)
            .map((val) => this.formatDate(val.date)),
          y: get(d, 'trips.days', [])
            .filter(this.filterLastWeek)
            .map((val) => val.total_subsidized),
        },
        tripsSubsidizedPerDayCumulated: {
          x: get(d, 'trips.days', []).map((val) => this.formatDate(val.date)),
          y: get(d, 'trips.days', []).reduce(this.reduceCumulativeSubsidizedData, []),
        },
        distancePerMonth: {
          x: get(d, 'distance.months', []).map((val) => this.formatDate(val.date)),
          // tslint:disable-next-line:no-bitwise
          y: get(d, 'distance.months', []).map((i) => (i.total / 1000) | 0),
        },
        distancePerDay: {
          x: get(d, 'distance.days', [])
            .filter(this.filterLastWeek)
            .map((val) => this.formatDate(val.date)),
          // tslint:disable-next-line:no-bitwise
          y: get(d, 'distance.days', [])
            .filter(this.filterLastWeek)
            // tslint:disable-next-line:no-bitwise
            .map((i) => (i.total / 1000) | 0),
        },
        distancePerDayCumulated: {
          x: get(d, 'distance.days', []).map((val) => this.formatDate(val.date)),
          y: get(d, 'distance.days', [])
            .reduce(this.reduceCumulativeData, [])
            // tslint:disable-next-line:no-bitwise
            .map((i) => (i / 1000) | 0),
        },
        carpoolersPerMonth: {
          x: get(d, 'carpoolers.months', []).map((val) => this.formatDate(val.date)),
          y: get(d, 'carpoolers.months', []).map((val) => val.total),
        },
        carpoolersPerDay: {
          x: get(d, 'carpoolers.days', [])
            .filter(this.filterLastWeek)
            .map((val) => this.formatDate(val.date)),
          y: get(d, 'carpoolers.days', [])
            .filter(this.filterLastWeek)
            .map((val) => val.total),
        },
        carpoolersPerDayCumulated: {
          x: get(d, 'carpoolers.days', []).map((val) => this.formatDate(val.date)),
          y: get(d, 'carpoolers.days', []).reduce(this.reduceCumulativeData, []),
        },
        petrolPerMonth: {
          x: get(d, 'distance.months', []).map((val) => this.formatDate(val.date)),
          // tslint:disable-next-line:no-bitwise
          y: get(d, 'distance.months', []).map((i) => (i.total * petrolFactor) | 0),
        },
        petrolPerDay: {
          x: get(d, 'distance.days', [])
            .filter(this.filterLastWeek)
            .map((val) => this.formatDate(val.date)),
          // tslint:disable-next-line:no-bitwise
          y: get(d, 'distance.days', [])
            .filter(this.filterLastWeek)
            // tslint:disable-next-line:no-bitwise
            .map((i) => (i.total * petrolFactor) | 0),
        },
        petrolPerDayCumulated: {
          x: get(d, 'distance.days', []).map((val) => this.formatDate(val.date)),
          y: get(d, 'distance.days', [])
            .reduce(this.reduceCumulativeData, [])
            // tslint:disable-next-line:no-bitwise
            .map((i) => (i * petrolFactor) | 0),
        },
        co2PerMonth: {
          x: get(d, 'distance.months', []).map((val) => this.formatDate(val.date)),
          // tslint:disable-next-line:no-bitwise
          y: get(d, 'distance.months', []).map((i) => (i.total * co2Factor) | 0),
        },
        co2PerDay: {
          x: get(d, 'distance.days', [])
            .filter(this.filterLastWeek)
            .map((val) => this.formatDate(val.date)),
          // tslint:disable-next-line:no-bitwise
          y: get(d, 'distance.days', [])
            .filter(this.filterLastWeek)
            // tslint:disable-next-line:no-bitwise
            .map((i) => (i.total * co2Factor) | 0),
        },
        co2PerDayCumulated: {
          x: get(d, 'distance.days', []).map((val) => this.formatDate(val.date)),
          y: get(d, 'distance.days', [])
            .reduce(this.reduceCumulativeData, [])
            // tslint:disable-next-line:no-bitwise
            .map((i) => (i * co2Factor) | 0),
        },
        carpoolersPerVehiculePerDay: {
          x: get(d, 'carpoolers_per_vehicule.days', [])
            .filter(this.filterLastWeek)
            .map((val) => this.formatDate(val.date)),
          y: get(d, 'carpoolers_per_vehicule.days', [])
            .filter(this.filterLastWeek)
            .map((val) => val.total.toFixed(2)),
        },
        carpoolersPerVehiculePerMonth: {
          x: get(d, 'carpoolers_per_vehicule.months', []).map((val) => this.formatDate(val.date)),
          y: get(d, 'carpoolers_per_vehicule.months', []).map((val) => val.total.toFixed(2)),
        },
      },
    };

    this._formatedStat$.next(formatedStat);
    this._loaded$.next(true);
    this._loading$.next(false);
  }

  private reduceCumulativeData(p, c, i): any[] {
    p[i] = i > 0 ? p[i - 1] + c.total : c.total;
    return p;
  }

  private reduceCumulativeSubsidizedData(p, c, i): any[] {
    p[i] = i > 0 ? p[i - 1] + c.total_subsidized : c.total_subsidized;
    return p;
  }

  private filterLastWeek(val, idx, arr): boolean {
    return moment()
      .subtract(7, 'days')
      .isBefore(val.date);
  }

  // format ISO to chart js compatible
  private formatDate(date: string) {
    return moment(date).format('YYYY-MM-DD');
  }
}
