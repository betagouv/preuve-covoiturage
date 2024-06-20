import { PointInterface } from '../../../common/interfaces/PointInterface.ts';
import { MetaPersonInterface } from './CertificateMetaInterface.ts';

export enum RowType {
  OK = 'ok',
  EXPIRED = 'expired',
}

export interface ResultRowInterface {
  type: RowType;
  uuid: string;
  tz: string;
  start_at: Date;
  end_at: Date;
  created_at: Date;
  positions: PointInterface[];
  identity: { uuid: string };
  operator: { _id: number; uuid: string; name: string };
  driver: MetaPersonInterface;
  passenger: MetaPersonInterface;
}
