export interface TerritoryChildrenInterface {
  parent_id: number;
  children: { _id: number; name: string }[];
}

export interface TerritoryParentChildrenInterface {
  parent: { _id: number; name: string };
  _id: number;
  children: { _id: number; name: string }[];
}
