export enum CarpoolTypeEnum {
  DRIVER = 'driver',
  PASSENGER = 'passenger',
}

export interface CarpoolInterface {
  type: CarpoolTypeEnum;
  datetime: Date;
  trips: number;
  distance?: number;
  km?: number;
  amount: number;
}

export type DBCarpoolInterface = Omit<CarpoolInterface, 'datetime'> & { date: string };
