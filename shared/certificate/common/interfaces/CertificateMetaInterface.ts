import { PointInterface } from '../../../common/interfaces/PointInterface';
import { CarpoolInterface } from './CarpoolInterface';

export type MetaPersonDisplayInterface = Pick<CarpoolInterface, 'uniq_days' | 'trips' | 'km' | 'euros'>;

export interface MetaPersonInterface {
  weeks: Omit<CarpoolInterface, 'month'>[];
  months: Omit<CarpoolInterface, 'week'>[];
  total: Omit<CarpoolInterface, 'week' | 'month'> | null;
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
