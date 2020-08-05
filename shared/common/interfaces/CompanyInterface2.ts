// FIXME: remove old CompanyInterface
export interface CompanyInterface {
  _id?: number;
  siret: string;
  siren: string;
  nic: string;
  legal_name: string;
  company_naf_code: string;
  establishment_naf_code: string;
  legal_nature_code: string;
  legal_nature_label: string;
  nonprofit_code?: string;
  intra_vat?: string;
  address?: string;
  lon?: number;
  lat?: number;
  headquarter: boolean;
  updated_at?: Date;
}
