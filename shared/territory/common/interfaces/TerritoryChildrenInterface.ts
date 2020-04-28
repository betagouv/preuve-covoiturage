export interface TerritoryChildrenInterface {
  parent_id: number;
  children: { _id: number; name: string }[];
}

export interface TerritoryParentChildrenInterface {
  parent: { _id: number; name: string };
  _id: number;
  descendant_ids: number[];
  children: { _id: number; name: string }[];
}
