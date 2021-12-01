export enum CarpoolTypeEnum {
  DRIVER = 'driver',
  PASSENGER = 'passenger',
}

export interface CarpoolInterface {
  type: CarpoolTypeEnum;
  datetime: Date;
  trips: number;
  km: number;
  euros: number;
}

export type DBCarpoolInterface = Omit<CarpoolInterface, 'datetime'> & { date: string };
