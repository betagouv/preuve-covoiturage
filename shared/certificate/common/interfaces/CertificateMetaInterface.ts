import { PointInterface } from '../../../common/interfaces/PointInterface';

export interface MetaRowInterface {
  index: number;
  month: string;
  trips: number;
  distance: number;
  remaining: number;
}

export interface CertificateMetaInterface {
  tz: string;
  identity: { uuid: string };
  operator: { uuid: string; name: string; thumbnail: string };
  territory?: { uuid: string; name: string };
  start_pos?: PointInterface;
  end_pos?: PointInterface;
  total_tr: number;
  total_km: number;
  total_point: number;
  total_rm: number;
  rows: MetaRowInterface[];
}
