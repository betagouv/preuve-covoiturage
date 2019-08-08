import { TripClass } from '~/core/entities/trip/trip-class';

export class IncentiveRules {
  weekday: number[];
  time: IncentiveTimeRule[];
  range: { min: number; max: number };
  ranks: TripClass[];
  onlyMajorPeople: boolean;
  forDriver: boolean;
  forPassenger: boolean;
}

export class IncentiveTimeRule {
  start: Date;
  end: Date;
}
