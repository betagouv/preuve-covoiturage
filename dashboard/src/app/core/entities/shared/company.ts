/* tslint:disable:variable-name*/
export class Company {
  siren: { type: string; required: true };
  naf_etablissement?: string;
  naf_entreprise?: string;
  nature_juridique?: string;
  cle_nic?: string;
  rna?: string;
  vat_intra?: string;

  constructor(obj: {
    siren: { type: string; required: true };
    naf_etablissement?: string;
    naf_entreprise?: string;
    nature_juridique?: string;
    cle_nic?: string;
    rna?: string;
    vat_intra?: string;
  }) {
    this.siren = obj.siren;
    this.naf_etablissement = obj.naf_etablissement;
    this.naf_entreprise = obj.naf_entreprise;
    this.nature_juridique = obj.nature_juridique;
    this.cle_nic = obj.cle_nic;
    this.rna = obj.rna;
    this.vat_intra = obj.vat_intra;
  }
}
