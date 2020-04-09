export enum RestrictionPeriodsEnum {
  DAY = 'day',
  MONTH = 'month',
  // YEAR = 'year',
  ALL = 'campaign',
}

export enum RestrictionUnitEnum {
  AMOUNT = 'amount',
  TRIP = 'trip',
}

export enum RestrictionTargetsEnum {
  DRIVER = 'driver',
  PASSENGER = 'passenger',
}

export const RESTRICTION_PERIODS: RestrictionPeriodsEnum[] = Object.values(RestrictionPeriodsEnum);

export const RESTRICTION_PERIODS_FR = {
  [RestrictionPeriodsEnum.DAY]: 'jour',
  [RestrictionPeriodsEnum.MONTH]: 'mois',
  // [RestrictionPeriodsEnum.YEAR]: 'année',
  [RestrictionPeriodsEnum.ALL]: 'durée de la campagne',
};
