export interface TerritoryChildrenInterface {
  parent_id: number;
  children: { _id: number; name: string }[];
}
