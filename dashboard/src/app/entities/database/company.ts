/* tslint:disable:variable-name*/
export class Company {
  siren: { type: string, required: true };
  naf_etablissement: string;
  naf_entreprise: string;
  nature_juridique: string;
  cle_nic: string;
  rna: string;
  vat_intra: string;

  constructor(obj?: any) {
    this.siren = obj && obj.siren || null;
    this.naf_etablissement = obj && obj.naf_etablissement || null;
    this.naf_entreprise = obj && obj.naf_entreprise || null;
    this.nature_juridique = obj && obj.nature_juridique || null;
    this.cle_nic = obj && obj.cle_nic || null;
    this.rna = obj && obj.rna || null;
    this.vat_intra = obj && obj.vat_intra || null;
  }
}
