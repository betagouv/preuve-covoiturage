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

  protected findDriverIncentives(): IncentiveInterface[] {
    const driverCarpoolIds = this.trip.filter((p) => p.is_driver).map((p) => p.carpool_id);
    return this.incentives.filter((i) => driverCarpoolIds.indexOf(i.carpool_id) > -1);
  }

  protected pickDriverIncentive(): IncentiveInterface | null {
    return this.findDriverIncentives().sort((a, b) => (a.amount > b.amount ? -1 : a.amount < b.amount ? 1 : 0))[0];
  }

  public distributeDriverIncentives(): TripIncentives {
    const driverIncentive = this.pickDriverIncentive();
    if (!driverIncentive) {
      return this;
    }
    const { amount: amountToDistribute, result: resultToDistribute } = driverIncentive;
    const toReplaceIncentives = this.findDriverIncentives();

    const amountToDistributeEach = Math.round(amountToDistribute / toReplaceIncentives.length);
    const resultToDistributeEach = Math.round(resultToDistribute / toReplaceIncentives.length);

    for (const incentive of toReplaceIncentives) {
      const index = this.incentives.findIndex((i) => i.carpool_id === incentive.carpool_id);
      if (index > -1) {
        this.incentives[index] = {
          ...incentive,
          amount: amountToDistributeEach,
          result: resultToDistributeEach,
        };
      }
    }

    return this;
  }
}
