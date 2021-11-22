import { PointInterface } from '../../../common/interfaces/PointInterface';
import { CarpoolInterface } from './CarpoolInterface';

export interface MetaPersonDisplayInterface {
  datetime: Date;
  trips: number;
  km: number;
  euros: number;
}

export interface MetaPersonInterface {
  total: {
    trips: number;
    week_trips: number;
    weekend_trips: number;
    km: number;
    euros: number;
  };
  trips: CarpoolInterface[];
}

export interface CertificateMetaInterface {
  tz: string;
  identity: { uuid: string };
  operator: { uuid: string; name: string };
  start_pos?: PointInterface;
  end_pos?: PointInterface;
  driver: MetaPersonInterface;
  passenger: MetaPersonInterface;
}
