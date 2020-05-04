/* tslint:disable:variable-name*/
import { CompanyInterface } from '~/core/entities/api/shared/common/interfaces/CompanyInterface2';

export class CompanyV2 {
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

  constructor(obj?: CompanyInterface) {
    if (obj) this.map(obj);
  }

  map(data: any): CompanyV2 {
    if (data.company_naf_code) this.company_naf_code = data.company_naf_code;
    if (data.legal_nature_label) this.legal_nature_label = data.legal_nature_label;
    if (data.nonprofit_code) this.nonprofit_code = data.nonprofit_code;
    if (data.intra_vat) this.intra_vat = data.intra_vat;
    return this;
  }
}
