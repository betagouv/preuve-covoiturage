export enum CarpoolTypeEnum {
  DRIVER = 'driver',
  PASSENGER = 'passenger',
}

export interface CarpoolInterface {
  type: CarpoolTypeEnum;
  datetime: Date;
  trips: number;
  distance: number;
  amount: number;
}

export type DBCarpoolInterface = Omit<CarpoolInterface, 'datetime'> & { date: string };
