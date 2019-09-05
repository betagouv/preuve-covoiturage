/* tslint:disable:variable-name*/
export class Company {
  siren: string;
  naf_entreprise?: string;
  nature_juridique?: string;
  cle_nic?: string;
  rna?: string;
  vat_intra?: string;

  constructor(obj: {
    siren: string;
    naf_entreprise?: string;
    nature_juridique?: string;
    cle_nic?: string;
    rna?: string;
    vat_intra?: string;
  }) {
    this.siren = obj.siren;
    this.naf_entreprise = obj.naf_entreprise || null;
    this.nature_juridique = obj.nature_juridique || null;
    this.cle_nic = obj.cle_nic || null;
    this.rna = obj.rna || null;
    this.vat_intra = obj.vat_intra || null;
  }
}
