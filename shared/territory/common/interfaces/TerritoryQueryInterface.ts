import { GeoPositionInterface } from '../../../common/interfaces/GeoPositionInterface';
import { TerritoryCodesInterface } from './TerritoryCodeInterface';

export interface TerritoryQueryInterface extends Partial<TerritoryCodesInterface> {
  search?: string;
  has_child_id?: number;
  has_parent_id?: number;
  has_ancestor_id?: number;
  has_descendant_id?: number;
  name?: string;
  company_name?: string;
  position?: GeoPositionInterface,
  active?: boolean;
}

export enum SortEnum {
  AreaAsc = '+area',
  AreaDesc = '-area',
  NameAsc = '+name',
  NameDesc = '-name',
};

export enum BasicFieldEnum {
  Id = '_id',
  CompanyId = 'company_id',
  Level = 'level',
  Name = 'name',
  Active = 'active',
};

export enum ActiveFieldEnum {
  ActiveSince = 'active_since',
  Contacts = 'contacts',
  CreatedAt = 'created_at',
  UpdatedAt = 'updated_at',
}

export enum GeoFieldEnum {
  Density = 'density',
  Geo = 'geo',
}

export enum RelationFiedEnum {
  Children = 'children',
  Parents = 'parents',
  Descendants = 'descendants',
  Ancestors = 'ancestors',
  // ActiveDescendants = 'activeDescendants',
  // EndingDescendants = 'endingDescendants',
};

export interface PaginationInterface {
  skip: number;
  limit: number;
}
