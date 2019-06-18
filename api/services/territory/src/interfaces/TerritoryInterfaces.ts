export interface TerritoryBaseInterface {
  name?: string;
  shortname?: string;
  acronym?: string;
  insee?: string[];
  insee_main?: string;
  network_id?: number;

  company?: {
    siren: string;
    region: string;
    naf_etablissement: string;
    naf_entreprise: string;
    nature_juridique: string;
    cle_nic: string;
    rna: string;
    vat_intra: string;
  };

  address?: {
    street: string;
    city: string;
    country: string;
    postcode: string;
    cedex: string;
  };

  contacts?: {
    phone: string;
    email: string;
    rgpd_dpo: string; // objectId
    rgpd_controller: string; // objectId
    technical: string; // objectId
  };

  cgu?: {
    accepted: boolean;
    accepted_at: Date;
    accepted_by: string; // objectId
  };

  geometry?: {
    type: string;
    coordinates: any[];
  };
}

export interface TerritoryDbInterface extends TerritoryBaseInterface {
  _id: string;
  name: string;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateTerritoryParamsInterface extends TerritoryBaseInterface {
  name: string;
}

export interface PatchTerritoryParamsInterface extends TerritoryBaseInterface {}
