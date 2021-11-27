import { PointInterface } from '../../../common/interfaces/PointInterface';
import { MetaPersonInterface } from './CertificateMetaInterface';

export enum RowType {
  OK = 'ok',
  EXPIRED = 'expired',
}

export interface ResultRowInterface {
  type: RowType;
  uuid: string;
  tz: string;
  positions: PointInterface[];
  operator: { _id: number; uuid: string; name: string };
  driver: MetaPersonInterface;
  passenger: MetaPersonInterface;
}
