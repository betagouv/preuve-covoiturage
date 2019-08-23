import { TripClassEnum } from '~/core/enums/trip/trip-class.enum';

export class IncentiveRules {
  weekday: number[];
  time: IncentiveTimeRule[];
  range: { min: number; max: number };
  ranks: TripClassEnum[];
  onlyMajorPeople: boolean;
  forDriver: boolean;
  forPassenger: boolean;
}

export class IncentiveTimeRule {
  start: string;
  end: string;
}
