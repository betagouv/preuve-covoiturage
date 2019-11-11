export interface CertificateMetaInterface {
  total_km: number;
  total_point: number;
  total_cost: number;
  remaining: number;
}

export interface CertificateAccessLogInterface {
  certificate_id?: string;
  ip: string;
  user_agent: string;
  user_id: string;
  content_type: string;
  created_at: Date;
}

export interface CertificateBaseInterface {
  identity_id: string;
  operator_id: string;
  territory_id: string;
  start_at: Date;
  end_at: Date;
  meta: CertificateMetaInterface;
}
