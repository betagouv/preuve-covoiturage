import { IncentiveInterface, TripInterface, PersonInterface } from '../interfaces';

export class TripIncentives {
  constructor(protected trip: TripInterface, protected incentives: IncentiveInterface[] = []) {}

  static createFromTrip(trip: TripInterface): TripIncentives {
    return new TripIncentives(trip);
  }

  public getProcessablePeople(): PersonInterface[] {
    return [...this.trip];
  }

  public addIncentive(incentive: IncentiveInterface): TripIncentives {
    this.incentives.push(incentive);
    return this;
  }

  public getIncentives(): IncentiveInterface[] {
    return this.incentives;
  }
}
