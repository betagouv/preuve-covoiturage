import { OperatorDbInterface } from '../interfaces/OperatorInterfaces';

export class Operator implements OperatorDbInterface {
  public _id: string;
  // tslint:disable-next-line
  public nom_commercial: string;
  // tslint:disable-next-line
  public raison_sociale: string;
  public company: {
    siren: string;
    naf_etablissement: string;
    naf_entreprise: string;
    nature_juridique: string;
    cle_nic: string;
    rna: string;
    vat_intra: string;
  };
  public address: {
    street: string;
    city: string;
    country: string;
    postcode: string;
    cedex: string;
  };
  public bank: {
    bank_name: string;
    client_name: string;
    iban: string;
    bic: string;
  };
  public contacts: {
    rgpd_dpo: string;
    rgpd_controller: string;
    technical: string;
  };
  public cgu: {
    accepted: boolean;
    acceptedAt: Date;
    acceptedBy: string;
  };
  public applications: any; // TODO
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;

  public constructor(data: {
    _id: string;
    nom_commercial: string;
    raison_sociale: string;
    company: {
      siren: string;
      naf_etablissement: string;
      naf_entreprise: string;
      nature_juridique: string;
      cle_nic: string;
      rna: string;
      vat_intra: string;
    };
    address: {
      street: string;
      city: string;
      country: string;
      postcode: string;
      cedex: string;
    };
    bank: {
      bank_name: string;
      client_name: string;
      iban: string;
      bic: string;
    };
    contacts: {
      rgpd_dpo: string;
      rgpd_controller: string;
      technical: string;
    };
    cgu: {
      accepted: boolean;
      acceptedAt: Date;
      acceptedBy: string;
    };
    applications: any; // TODO
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
  }) {
    this._id = data._id;
    this.nom_commercial = data.nom_commercial;
    this.raison_sociale = data.raison_sociale;
    this.company = data.company;
    this.address = data.address;
    this.bank = data.bank;
    this.contacts = data.contacts;
    this.cgu = data.cgu;
    this.applications = data.applications;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
  }
}
