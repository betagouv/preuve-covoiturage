// tslint:disable:no-bitwise
import { Injectable } from '@angular/core';
import { get } from 'lodash';
import * as moment from 'moment';

import { CalculatedStat } from '~/core/entities/stat/calculatedStat';
import { Axes, FormatedStatInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';

import { co2Factor, petrolFactor } from '../config/stat';

@Injectable({
  providedIn: 'root',
})
export class StatFormatService {
  formatData(data: StatInterface[]): FormatedStatInterface {
    const calculatedStats = this.calculateStats(data);
    const formatedStats = this.formatUxStats(calculatedStats);
    return formatedStats;
  }

  private calculateStats(result: StatInterface[]): CalculatedStat {
    const fillDays = (acc, target, date, data = {}) => {
      Object.keys(data).forEach((key) => {
        acc[target][key] += data[key];
      });
      acc[target].days.push({
        date,
        ...data,
      });
    };
    const fillMonth = (acc, target, day, data = {}) => {
      const monthIndex = acc[target].months.findIndex(
        (month) =>
          month.date ===
          moment(day)
            .startOf('month')
            .toISOString(),
      );
      if (monthIndex === -1) {
        acc[target].months.push({
          // set first date of month
          date: moment(day)
            .startOf('month')
            .toISOString(),
          ...data,
        });
      } else {
        // accumulate total sum
        const month = acc[target].months[monthIndex];
        Object.keys(data).forEach((key) => {
          month[key] += data[key];
        });
        acc[target].months[monthIndex] = month;
      }
    };

    const { carpoolers, carpoolers_per_vehicule, distance, trips } = result.reduce(
      (acc, current) => {
        fillDays(acc, 'carpoolers', current.day, { total: current.carpoolers });
        fillMonth(acc, 'carpoolers', current.day, { total: current.carpoolers });
        fillDays(acc, 'distance', current.day, { total: current.distance });
        fillMonth(acc, 'distance', current.day, { total: current.distance });
        fillDays(acc, 'trips', current.day, {
          total: current.trip,
          total_subsidized: current.trip_subsidized,
        });
        fillMonth(acc, 'trips', current.day, {
          total: current.trip,
          total_subsidized: current.trip_subsidized,
        });
        fillDays(acc, 'carpoolers_per_vehicule', current.day, { total: current.carpoolers / current.trip });

        return acc;
      },
      {
        carpoolers: {
          total: 0,
          days: [],
          months: [],
        },
        carpoolers_per_vehicule: {
          total: 0,
          days: [],
          months: [],
        },
        distance: {
          total: 0,
          days: [],
          months: [],
        },
        trips: {
          total: 0,
          total_subsidized: 0,
          days: [],
          months: [],
        },
      },
    );

    const cpvm = carpoolers_per_vehicule.days.reduce((acc, current) => {
      const month = moment(current.date)
        .endOf('month')
        .toISOString();
      if (!(month in acc)) {
        acc[month] = [];
      }
      acc[month].push(current.total);
      return acc;
    }, {});

    // calculate stats
    return {
      carpoolers,
      distance,
      trips,
      carpoolers_per_vehicule: {
        total:
          carpoolers_per_vehicule.days.map((day) => day.total).reduce((acc, value) => acc + value, 0) /
          carpoolers_per_vehicule.days.length,
        months: Object.keys(cpvm).map((key) => ({
          date: key,
          total: cpvm[key].reduce((acc, curr) => acc + curr, 0) / cpvm[key].length,
        })),
        days: carpoolers_per_vehicule.days,
      },
    };
  }

  private formatUxStats(d: CalculatedStat): FormatedStatInterface {
    const formatedStat = <FormatedStatInterface>{
      total: {
        trips: get(d, 'trips.total', 0),
        distance: get(d, 'distance.total', 0) | 0,
        carpoolers: get(d, 'carpoolers.total', 0),
        petrol: (get(d, 'distance.total', 0) * petrolFactor) | 0,
        co2: (get(d, 'distance.total', 0) * co2Factor) | 0,
        carpoolersPerVehicule: get(d, 'carpoolers_per_vehicule.total', 0)
          ? Number(get(d, 'carpoolers_per_vehicule.total', 0)).toFixed(2)
          : 0,
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
            .map((i) => i.total | 0),
        }),
        distancePerDay: this.fixWeekDisplay({
          x: get(d, 'distance.days', [])
            .filter(this.filterLastWeek)
            .map((val) => this.formatDate(val.date)),
          // tslint:disable-next-line:no-bitwise
          y: get(d, 'distance.days', [])
            .filter(this.filterLastWeek)
            // tslint:disable-next-line:no-bitwise
            .map((i) => i.total | 0),
        }),
        distancePerDayCumulated: {
          x: get(d, 'distance.days', [])
            .filter(this.filterOutFutur)
            .map((val) => this.formatDate(val.date)),
          y: get(d, 'distance.days', [])
            .reduce(this.reduceCumulativeData, [])
            // tslint:disable-next-line:no-bitwise
            .map((i) => i | 0),
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

    return formatedStat;
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
