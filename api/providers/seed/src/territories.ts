export enum TerritoryCodeEnum {
  Insee = 'insee',
  Postcode = 'postcode',
  Id = '_id',
}
export interface TerritorySelectorsInterface {
  [TerritoryCodeEnum.Insee]?: string[];
  [TerritoryCodeEnum.Postcode]?: string[];
  [TerritoryCodeEnum.Id]?: number[];
}

export interface TerritoryGroupInterface {
  _id: number;
  company_id: number;
  name: string;
  shortname: string;
  contacts;
  address: {
    street: string;
    postcode: string;
    cedex?: string;
    city: string;
    country: string;
  };
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  selector: TerritorySelectorsInterface;
}

export type CreateTerritoryGroupInterface = Omit<
  TerritoryGroupInterface,
  '_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'shortname'
>;

export const territory_groups: CreateTerritoryGroupInterface[] = [
  {
    company_id: 1,
    name: 'Ile-De-France-Mobilité',
    contacts: {},
    address: {
      street: '39 bis-41 rue de Châteaudun',
      postcode: '75009 Paris',
      cedex: 'Paris',
      city: 'Paris',
      country: 'France',
    },
    selector: { _id: [2] },
  },
];
