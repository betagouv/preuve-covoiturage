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
  operator: { uuid: string; name: string };
  start_pos?: PointInterface;
  end_pos?: PointInterface;
  driver: MetaPersonInterface;
  passenger: MetaPersonInterface;
}
