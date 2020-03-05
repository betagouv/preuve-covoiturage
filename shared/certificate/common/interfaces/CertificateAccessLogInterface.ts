export interface CertificateAccessLogInterface {
  certificate_id?: number;
  ip: string;
  user_agent: string;
  user_id: string;
  content_type: string;
  created_at: Date;
}
