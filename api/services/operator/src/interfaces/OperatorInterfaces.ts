export interface OperatorBaseInterface {
  nom_commercial?: string;
  raison_sociale?: string;
  company?: {
    siren?: string,
    naf_etablissement?: string,
    naf_entreprise?: string,
    nature_juridique?: string,
    cle_nic?: string,
    rna?: string,
    vat_intra?: string,
  };
  address?: {
    street?: string,
    city?: string,
    country?: string,
    postcode?: string,
    cedex?: string,
  };
  bank?: {
    bank_name?: string,
    client_name?: string,
    iban?: string,
    bic?: string,
  };
  contacts?: {
    rgpd_dpo?: string,
    rgpd_controller?: string,
    technical?: string,
  };
  cgu?: {
    accepted?: boolean,
    acceptedAt?: Date,
    acceptedBy?: string,
  };
  applications?: any; // TODO
}

export interface OperatorDbInterface extends OperatorBaseInterface {
  _id: string;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateOperatorParamsInterface extends OperatorBaseInterface {
};

export interface PatchOperatorParamsInterface extends OperatorBaseInterface {};
