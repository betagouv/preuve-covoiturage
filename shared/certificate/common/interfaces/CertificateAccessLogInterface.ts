export interface CertificateAccessLogInterface {
  certificate_id?: string;
  ip: string;
  user_agent: string;
  user_id: string;
  content_type: string;
  created_at: Date;
}
