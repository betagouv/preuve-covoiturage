export type TerritoryBaseRelationInterface = number[];

export interface TerritoryDirectRelationInterface {
  parents: TerritoryBaseRelationInterface;
  children: TerritoryBaseRelationInterface;
}

export interface TerritoryRecursiveRelationInterface {
  ancestors: TerritoryBaseRelationInterface;
  descendants: TerritoryBaseRelationInterface;
}

export interface TerritoryRelationInterface
  extends TerritoryDirectRelationInterface,
    TerritoryRecursiveRelationInterface {}
