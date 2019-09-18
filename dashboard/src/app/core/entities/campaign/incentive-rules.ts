import { TripClassEnum } from '~/core/enums/trip/trip-class.enum';
import { RulesRangeType } from '~/core/types/campaign/rulesRangeType';

export class IncentiveRules {
  weekday: number[];
  time: IncentiveTimeRule[];
  range: RulesRangeType;
  ranks: TripClassEnum[];
  onlyAdult: boolean;
  forDriver: boolean;
  forPassenger: boolean;
  forTrip: boolean;
  operatorIds: string[];
  constructor(obj: IncentiveRulesInterface) {
    this.weekday = obj.weekday;
    this.time = obj.time;
    this.range = obj.range;
    this.ranks = obj.ranks;
    this.onlyAdult = obj.onlyAdult;
    this.forDriver = obj.forDriver;
    this.forPassenger = obj.forPassenger;
    this.forTrip = obj.forTrip;
    this.operatorIds = obj.operatorIds;
  }
}

export interface IncentiveRulesInterface {
  weekday: number[];
  time: IncentiveTimeRule[];
  range: RulesRangeType;
  ranks: TripClassEnum[];
  onlyAdult: boolean;
  forDriver: boolean;
  forPassenger: boolean;
  forTrip: boolean;
  operatorIds: string[];
}

export class IncentiveTimeRule {
  start: string;
  end: string;
}
