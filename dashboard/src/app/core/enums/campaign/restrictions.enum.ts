export enum RestrictionPeriodsEnum {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  TRIMESTER = 'trimester',
  ALL = 'all',
}

export const RESTRICTION_PERIODS: RestrictionPeriodsEnum[] = Object.values(RestrictionPeriodsEnum);

export const RESTRICTION_PERIODS_FR = {
  [RestrictionPeriodsEnum.DAY]: 'jour',
  [RestrictionPeriodsEnum.WEEK]: 'semaine',
  [RestrictionPeriodsEnum.MONTH]: 'mois',
  [RestrictionPeriodsEnum.TRIMESTER]: 'trimestre',
  [RestrictionPeriodsEnum.ALL]: 'durée de la campagne',
};
