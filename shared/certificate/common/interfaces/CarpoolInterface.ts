export enum CarpoolTypeEnum {
  DRIVER = 'driver',
  PASSENGER = 'passenger',
}

export interface CarpoolInterface {
  type: CarpoolTypeEnum;
  week: number | null; // some values are null due to grouping sets
  month: number | null; // some values are null due to grouping sets
  datetime: Date;
  uniq_days: number;
  trips: number;
  lun: boolean;
  mar: boolean;
  mer: boolean;
  jeu: boolean;
  ven: boolean;
  sam: boolean;
  dim: boolean;
  km: number;
  euros: number;
}
