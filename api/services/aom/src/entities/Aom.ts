import { AomDbInterface } from '../interfaces/AomInterfaces';

export class Aom implements AomDbInterface {
  public _id: string;
  public name: string;
  public shortname?: string;
  public acronym?: string;
  public insee?: string[];
  public insee_main?: string;
  public network_id?: number;

  public company?: {
    siren: string,
    region: string,
    naf_etablissement: string,
    naf_entreprise: string,
    nature_juridique: string,
    cle_nic: string,
    rna: string,
    vat_intra: string,
  };

  public address?: {
    street: string,
    city: string,
    country: string,
    postcode: string,
    cedex: string,
  };

  public contacts?: {
    phone: string,
    email: string,
    rgpd_dpo: string, // objectId
    rgpd_controller: string, // objectId
    technical: string, // objectId
  };

  public cgu: {
    accepted: boolean,
    accepted_at: Date,
    accepted_by: string, // objectId
  };

  public geometry?: {
    type: string,
    coordinates: any[],
  };

  public deleted_at?: Date;
  public created_at?: Date;
  public updated_at?: Date;

  constructor(data: {
    _id: string,
    name: string,
    shortname?: string,
    acronym?: string,
    insee?: string[],
    insee_main?: string,
    network_id?: number,
    company?: {
      siren: string,
      region: string,
      naf_etablissement: string,
      naf_entreprise: string,
      nature_juridique: string,
      cle_nic: string,
      rna: string,
      vat_intra: string,
    },
    address?: {
      street: string,
      city: string,
      country: string,
      postcode: string,
      cedex: string,
    },
    contacts?: {
      phone: string,
      email: string,
      rgpd_dpo: string, // objectId
      rgpd_controller: string, // objectId
      technical: string, // objectId
    },
    cgu: {
      accepted: boolean,
      accepted_at: Date,
      accepted_by: string, // objectId
    },
    geometry?: {
      type: string,
      coordinates: any[],
    },
    deleted_at?: Date,
    created_at?: Date,
    updated_at?: Date,
  }) {
    this._id = data._id;
    this.name = data.name;
    this.shortname = data.shortname;
    this.acronym = data.acronym;
    this.insee = data.insee;
    this.insee_main = data.insee_main;
    this.network_id = data.network_id;
    this.company = data.company;
    this.address = data.address;
    this.contacts = data.contacts;
    this.cgu = data.cgu;
    this.geometry = data.geometry;
    this.deleted_at = data.deleted_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}
