export class Company {
  naf_entreprise: string;
  nature_juridique: string;
  rna: string;
  vat_intra: string;
  naf_etablissement: string;
  siret: string;

  constructor(
    obj: {
      naf_entreprise?: string;
      nature_juridique?: string;
      rna?: string;
      vat_intra?: string;
      siret?: string;
    } = {},
  ) {
    if (obj && obj.naf_entreprise) this.naf_entreprise = obj.naf_entreprise;
    if (obj && obj.nature_juridique) this.nature_juridique = obj.nature_juridique;
    if (obj && obj.rna) this.rna = obj.rna;
    if (obj && obj.vat_intra) this.vat_intra = obj.vat_intra;
    if (obj && obj.siret) this.siret = obj.siret;
  }

  toFormValues(): any {
    const formVal = {
      naf_entreprise: '',
      nature_juridique: '',
      rna: '',
      vat_intra: '',
      siret: '',
      ...this,
    };

    return formVal;
  }
}
