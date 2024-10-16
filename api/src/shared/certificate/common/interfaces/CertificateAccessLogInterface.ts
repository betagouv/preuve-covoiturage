export interface CertificateAccessLogInterface {
  certificate_id?: string;
  created_at?: Date;
  ip: string;
  user_agent: string;
  user_id: string;
  content_type: string;
}
