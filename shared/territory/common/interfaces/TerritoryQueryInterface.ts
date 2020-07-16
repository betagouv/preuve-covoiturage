import { GeoPositionInterface } from '../../../common/interfaces/GeoPositionInterface';
import { TerritoryCodesInterface } from './TerritoryCodeInterface';

export interface TerritoryQueryInterface extends Partial<TerritoryCodesInterface> {
  _id?: number;
  search?: string;
  has_child_id?: number;
  has_parent_id?: number;
  has_ancestor_id?: number;
  has_descendant_id?: number;
  name?: string;
  company_name?: string;
  position?: GeoPositionInterface;
  active?: boolean;
}

export enum TerritoryQueryEnum {
  Id = '_id',
  Search = 'search',
  HasChildId = 'has_child_id',
  HasParentId = 'has_parent_id',
  HasAncestorId = 'has_ancestor_id',
  HasDescendantId = 'has_descendant_id',
  Name = 'name',
  CompanyName = 'company_legal_name',
  Position = 'position',
  Active = 'active',
}

export const allTerritoryQueryRelationFields: TerritoryQueryEnum[] = [
  TerritoryQueryEnum.HasChildId,
  TerritoryQueryEnum.HasParentId,
  TerritoryQueryEnum.HasAncestorId,
  TerritoryQueryEnum.HasDescendantId,
];

export const allTerritoryQueryCompanyFields: TerritoryQueryEnum[] = [TerritoryQueryEnum.CompanyName];

export const allTerritoryQueryDirectFields: TerritoryQueryEnum[] = [
  TerritoryQueryEnum.Id,
  TerritoryQueryEnum.Name,
  TerritoryQueryEnum.Position,
  TerritoryQueryEnum.Active,
];

export const allTerritoryQueryFields: TerritoryQueryEnum[] = [
  ...allTerritoryQueryRelationFields,
  ...allTerritoryQueryCompanyFields,
  ...allTerritoryQueryDirectFields,
  TerritoryQueryEnum.Search,
];

export enum SortEnum {
  // AreaAsc = '+area',
  // AreaDesc = '-area',
  NameAsc = 'name ASC',
  NameDesc = 'name DESC',
}

export const allSortField = [SortEnum.NameAsc, SortEnum.NameDesc];

export enum BasicFieldEnum {
  Id = '_id',
  CompanyId = 'company_id',
  Level = 'level',
  Name = 'name',
  ShortName = 'shortname',
  Active = 'active',
  Address = 'address',
  Contacts = 'contacts',
  UIStatus = 'ui_status',
}

export enum ActiveFieldEnum {
  Active = 'active',
  CreatedAt = 'created_at',
  UpdatedAt = 'updated_at',
}

export enum GeoFieldEnum {
  // Density = 'density',
  Geo = 'geo',
}

export enum RelationFieldEnum {
  // Company = 'company',
  Children = 'children',
  Parent = 'parent',
  Descendants = 'descendants',
  Ancestors = 'ancestors',
  // ActiveDescendants = 'activeDescendants',
  // EndingDescendants = 'endingDescendants',
}

export enum TerritoryCodeEnum {
  Insee = 'insee',
  Postcode = 'postcode',
}

export enum CompanyEnum {
  Siret = 'siret',
  Siren = 'siren',
  Nic = 'nic',
  LegalName = 'legal_name',
}

export interface PaginationInterface {
  skip: number;
  limit: number;
}

export type TerritoryListFilter = {
  search?: string;
  skip?: number;
  limit?: number;
};

export type ProjectionFieldsEnum = (
  | RelationFieldEnum
  | BasicFieldEnum
  | ActiveFieldEnum
  | GeoFieldEnum
  | TerritoryCodeEnum
  | CompanyEnum)[];

export const allGeoFieldEnum: ProjectionFieldsEnum = [GeoFieldEnum.Geo];

export const allBasicFieldEnum: ProjectionFieldsEnum = [
  BasicFieldEnum.Id,
  BasicFieldEnum.CompanyId,
  BasicFieldEnum.Level,
  BasicFieldEnum.Name,
  BasicFieldEnum.ShortName,
  BasicFieldEnum.Active,
  BasicFieldEnum.Address,
  BasicFieldEnum.Contacts,
  BasicFieldEnum.UIStatus,
];

export const allTerritoryCodeEnum: ProjectionFieldsEnum = [TerritoryCodeEnum.Insee, TerritoryCodeEnum.Postcode];

export const allAncestorRelationFieldEnum: ProjectionFieldsEnum = [
  RelationFieldEnum.Descendants,
  RelationFieldEnum.Ancestors,
  RelationFieldEnum.Children,
  RelationFieldEnum.Parent,
  TerritoryCodeEnum.Insee,
  TerritoryCodeEnum.Postcode,
];
export const allCompanyFieldEnum: ProjectionFieldsEnum = [
  CompanyEnum.Siren,
  CompanyEnum.Siret,
  CompanyEnum.Nic,
  CompanyEnum.LegalName,
];

export const directFields: ProjectionFieldsEnum = [
  BasicFieldEnum.Id,
  BasicFieldEnum.CompanyId,
  BasicFieldEnum.Level,
  BasicFieldEnum.Name,
  BasicFieldEnum.ShortName,
  BasicFieldEnum.Active,
  BasicFieldEnum.Address,
  BasicFieldEnum.Contacts,
  BasicFieldEnum.UIStatus,
  ,
  // GeoFieldEnum.Density,
  GeoFieldEnum.Geo,
  ActiveFieldEnum.CreatedAt,
  ActiveFieldEnum.UpdatedAt,
];

export const allProjectionFields: ProjectionFieldsEnum = [
  ...directFields,
  ...allAncestorRelationFieldEnum,
  ...allCompanyFieldEnum,
  // ...allTerritoryCodeEnum,
];
