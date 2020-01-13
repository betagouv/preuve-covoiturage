/* tslint:disable:variable-name*/

export class CompanyV2 {
  company_naf_code: string;
  legal_nature_label: string;
  nonprofit_code: string;
  intra_vat: string;
  siret: string;

  constructor(
    obj: {
      company_naf_code?: string;
      legal_nature_label?: string;
      nonprofit_code?: string;
      intra_vat?: string;
    } = {},
  ) {
    if (obj && obj.company_naf_code) this.company_naf_code = obj.company_naf_code;
    if (obj && obj.legal_nature_label) this.legal_nature_label = obj.legal_nature_label;
    if (obj && obj.nonprofit_code) this.nonprofit_code = obj.nonprofit_code;
    if (obj && obj.intra_vat) this.intra_vat = obj.intra_vat;
  }

  toFormValues() {
    const formVal = {
      company_naf_code: '',
      legal_nature_label: '',
      nonprofit_code: '',
      intra_vat: '',
      ...this,
    };

    return formVal;
  }
}
