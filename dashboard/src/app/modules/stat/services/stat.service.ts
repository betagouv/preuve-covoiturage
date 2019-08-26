import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { get } from 'lodash';
import * as moment from 'moment';

import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { Stat } from '~/core/entities/stat/stat';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { Axes, FormatedStatInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';
import { ApiService } from '~/core/services/api/api.service';
import { StatInterface } from '~/core/interfaces/stat/statInterface';

import { co2Factor, petrolFactor } from '../config/stat';

@Injectable({
  providedIn: 'root',
})
export class StatService extends ApiService<StatInterface> {
  public _formatedStat$ = new BehaviorSubject<FormatedStatInterface>(null);
  public _loaded$ = new BehaviorSubject<boolean>(false);
  protected _loading$ = new BehaviorSubject<boolean>(false);

  constructor(private _http: HttpClient, private _jsonRPC: JsonRPCService) {
    super(_http, _jsonRPC, 'stat');
  }

  public loadOne(filter: FilterInterface = {}): Observable<Stat[]> {
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
        tripsPerMonth: this.fixMonthDisplay({
          x: get(d, 'trips.months', [])
            .filter(this.filterOutFutur)
            .map((val) => this.formatMonthDate(val.date)),
          y: get(d, 'trips.months', [])
            .filter(this.filterOutFutur)
            .map((val) => val.total),
        }),
        tripsPerDay: this.fixWeekDisplay({
          x: get(d, 'trips.days', [])
            .filter(this.filterLastWeek)
            .map((val) => this.formatDate(val.date)),
          y: get(d, 'trips.days', [])
            .filter(this.filterLastWeek)
            .map((val) => val.total),
        }),
        tripsPerDayCumulated: {
          x: get(d, 'trips.days', [])
            .filter(this.filterOutFutur)
            .map((val) => this.formatDate(val.date)),
          y: get(d, 'trips.days', [])
            .filter(this.filterOutFutur)
            .reduce(this.reduceCumulativeData, []),
        },
        tripsSubsidizedPerMonth: this.fixMonthDisplay({
          x: get(d, 'trips.months', [])
            .filter(this.filterOutFutur)
            .map((val) => this.formatMonthDate(val.date)),
          y: get(d, 'trips.months', [])
            .filter(this.filterOutFutur)
            .map((val) => val.total_subsidized),
        }),
        tripsSubsidizedPerDay: this.fixWeekDisplay({
          x: get(d, 'trips.days', [])
            .filter(this.filterLastWeek)
            .map((val) => this.formatDate(val.date)),
          y: get(d, 'trips.days', [])
            .filter(this.filterLastWeek)
            .map((val) => val.total_subsidized),
        }),
        tripsSubsidizedPerDayCumulated: {
          x: get(d, 'trips.days', [])
            .filter(this.filterOutFutur)
            .map((val) => this.formatDate(val.date)),
          y: get(d, 'trips.days', [])
            .filter(this.filterOutFutur)
            .reduce(this.reduceCumulativeSubsidizedData, []),
        },
        distancePerMonth: this.fixMonthDisplay({
          x: get(d, 'distance.months', [])
            .filter(this.filterOutFutur)
            .map((val) => this.formatMonthDate(val.date)),
          y: get(d, 'distance.months', [])
            .filter(this.filterOutFutur)
            // tslint:disable-next-line:no-bitwise
            .map((i) => (i.total / 1000) | 0),
        }),
        distancePerDay: this.fixWeekDisplay({
          x: get(d, 'distance.days', [])
            .filter(this.filterLastWeek)
            .map((val) => this.formatDate(val.date)),
          // tslint:disable-next-line:no-bitwise
          y: get(d, 'distance.days', [])
            .filter(this.filterLastWeek)
            // tslint:disable-next-line:no-bitwise
            .map((i) => (i.total / 1000) | 0),
        }),
        distancePerDayCumulated: {
          x: get(d, 'distance.days', [])
            .filter(this.filterOutFutur)
            .map((val) => this.formatDate(val.date)),
          y: get(d, 'distance.days', [])
            .reduce(this.reduceCumulativeData, [])
            // tslint:disable-next-line:no-bitwise
            .map((i) => (i / 1000) | 0),
        },
        carpoolersPerMonth: this.fixMonthDisplay({
          x: get(d, 'carpoolers.months', [])
            .filter(this.filterOutFutur)
            .map((val) => this.formatMonthDate(val.date)),
          y: get(d, 'carpoolers.months', [])
            .filter(this.filterOutFutur)
            .map((val) => val.total),
        }),
        carpoolersPerDay: this.fixWeekDisplay({
          x: get(d, 'carpoolers.days', [])
            .filter(this.filterLastWeek)
            .map((val) => this.formatDate(val.date)),
          y: get(d, 'carpoolers.days', [])
            .filter(this.filterLastWeek)
            .map((val) => val.total),
        }),
        carpoolersPerDayCumulated: {
          x: get(d, 'carpoolers.days', [])
            .filter(this.filterOutFutur)
            .map((val) => this.formatDate(val.date)),
          y: get(d, 'carpoolers.days', [])
            .filter(this.filterOutFutur)
            .reduce(this.reduceCumulativeData, []),
        },
        petrolPerMonth: this.fixMonthDisplay({
          x: get(d, 'distance.months', [])
            .filter(this.filterOutFutur)
            .map((val) => this.formatMonthDate(val.date)),
          y: get(d, 'distance.months', [])
            .filter(this.filterOutFutur)
            // tslint:disable-next-line:no-bitwise
            .map((i) => (i.total * petrolFactor) | 0),
        }),
        petrolPerDay: this.fixWeekDisplay({
          x: get(d, 'distance.days', [])
            .filter(this.filterLastWeek)
            .map((val) => this.formatDate(val.date)),
          // tslint:disable-next-line:no-bitwise
          y: get(d, 'distance.days', [])
            .filter(this.filterLastWeek)
            // tslint:disable-next-line:no-bitwise
            .map((i) => (i.total * petrolFactor) | 0),
        }),
        petrolPerDayCumulated: {
          x: get(d, 'distance.days', [])
            .filter(this.filterOutFutur)
            .map((val) => this.formatDate(val.date)),
          y: get(d, 'distance.days', [])
            .filter(this.filterOutFutur)
            .reduce(this.reduceCumulativeData, [])
            // tslint:disable-next-line:no-bitwise
            .map((i) => (i * petrolFactor) | 0),
        },
        co2PerMonth: this.fixMonthDisplay({
          x: get(d, 'distance.months', [])
            .filter(this.filterOutFutur)
            .map((val) => this.formatMonthDate(val.date)),
          y: get(d, 'distance.months', [])
            .filter(this.filterOutFutur)
            // tslint:disable-next-line:no-bitwise
            .map((i) => (i.total * co2Factor) | 0),
        }),
        co2PerDay: this.fixWeekDisplay({
          x: get(d, 'distance.days', [])
            .filter(this.filterLastWeek)
            .map((val) => this.formatDate(val.date)),
          y: get(d, 'distance.days', [])
            .filter(this.filterLastWeek)
            // tslint:disable-next-line:no-bitwise
            .map((i) => (i.total * co2Factor) | 0),
        }),
        co2PerDayCumulated: {
          x: get(d, 'distance.days', [])
            .filter(this.filterOutFutur)
            .map((val) => this.formatDate(val.date)),
          y: get(d, 'distance.days', [])
            .filter(this.filterOutFutur)
            .reduce(this.reduceCumulativeData, [])
            // tslint:disable-next-line:no-bitwise
            .map((i) => (i * co2Factor) | 0),
        },
        carpoolersPerVehiculePerDay: this.fixWeekDisplay({
          x: get(d, 'carpoolers_per_vehicule.days', [])
            .filter(this.filterLastWeek)
            .map((val) => this.formatDate(val.date)),
          y: get(d, 'carpoolers_per_vehicule.days', [])
            .filter(this.filterLastWeek)
            .map((val) => val.total.toFixed(2)),
        }),
        carpoolersPerVehiculePerMonth: this.fixMonthDisplay({
          x: get(d, 'carpoolers_per_vehicule.months', [])
            .filter(this.filterOutFutur)
            .map((val) => this.formatMonthDate(val.date)),
          y: get(d, 'carpoolers_per_vehicule.months', [])
            .filter(this.filterOutFutur)
            .map((val) => val.total.toFixed(2)),
        }),
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

  /**
   * After 7 days ago and before today
   */
  private filterLastWeek(val, idx, arr): boolean {
    return (
      moment()
        .subtract(7, 'days')
        .isBefore(val.date) && moment().isAfter(val.date)
    );
  }

  /**
   * Before today
   */
  private filterOutFutur(val, idx, arr): boolean {
    return moment().isAfter(val.date);
  }

  // format ISO to chart js compatible
  private formatDate(date: string): string {
    return moment(date).format('YYYY-MM-DD');
  }

  // format ISO to chart js compatible
  private formatMonthDate(date: string): string {
    return moment(date)
      .startOf('month')
      .format('YYYY-MM-DD');
  }

  /**
   * Show 7 day range event if days are missing
   * This solution is used instead of min / max on chart js options because of a display bug issue
   */
  private fixWeekDisplay(data: Axes): Axes {
    // add first & last week date if it doesn't exist
    if (0 < data.x.length && data.x.length < 7) {
      const sixDaysAgo = moment().subtract(6, 'days');
      const firstDate = moment(data.x[0]);

      // if first date is not correct
      if (firstDate.isAfter(sixDaysAgo)) {
        data.x.unshift(sixDaysAgo.format('YYYY-MM-DD'));
        data.y.unshift(0);
      }

      return data;
    }
    return data;
  }

  /**
   * Show at least 3 months range event if months are missing
   * This solution is used instead of min / max on chart js options because of a display bug issue
   */
  private fixMonthDisplay(data: Axes): Axes {
    // add first & last month date if it doesn't exist
    if (0 < data.x.length && data.x.length < 3) {
      const firstDate = moment(data.x[0]);
      const threeMonthsAgo = moment()
        .subtract(3, 'months')
        .startOf('month');

      // if first date is not correct
      if (firstDate.isAfter(threeMonthsAgo)) {
        data.x.unshift(threeMonthsAgo.format('YYYY-MM-DD'));
        data.y.unshift(0);
      }
      return data;
    }
    return data;
  }
}
