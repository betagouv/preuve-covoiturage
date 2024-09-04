import { PointInterface } from '../../../common/interfaces/PointInterface.ts';
import { CarpoolInterface } from './CarpoolInterface.ts';

export interface MetaPersonDisplayInterface {
  datetime: Date;
  trips: number;
  distance: number;
  amount: number;
}

export interface MetaPersonInterface {
  total: {
    trips: number;
    week_trips: number;
    weekend_trips: number;
    distance?: number;
    amount: number;
  };
  trips: CarpoolInterface[];
}

export interface CertificateMetaInterface {
  tz: string;
  positions: PointInterface[];
  identity: { uuid: string };
  operator: { uuid: string; name: string; support?: string };
  driver: MetaPersonInterface;
  passenger: MetaPersonInterface;
}
