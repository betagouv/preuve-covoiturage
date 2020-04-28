export interface CertificateMetaInterface {
  tz: string;
  operator: { uuid: string; name: string };
  territory: { uuid: string; name: string };
  total_km: number;
  total_point: number;
  total_cost: number;
  remaining: number;
  rows: object[];
}
