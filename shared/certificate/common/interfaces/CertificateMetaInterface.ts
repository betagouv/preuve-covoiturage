import { PointInterface } from '../../../common/interfaces/PointInterface';

export interface CertificateMetaInterface {
  tz: string;
  identity: { uuid: string };
  operator: { uuid: string; name: string; thumbnail: string };
  territory?: { uuid: string; name: string };
  start_pos?: PointInterface;
  end_pos?: PointInterface;
  total_km: number;
  total_point: number;
  total_cost: number;
  remaining: number;
  rows: object[];
}
