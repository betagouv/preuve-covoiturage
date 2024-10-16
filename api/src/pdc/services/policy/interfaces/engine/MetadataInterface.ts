export enum MetadataLifetime {
  Carpool = -1,
  Day = 0,
  Month = 1,
  Always = 2,
  Year = 3,
}

export interface MetadataVariableDefinitionInterface {
  uuid: string;
  key?: string;
  name?: string;
  scope?: string;
  initialValue?: number;
  lifetime?: MetadataLifetime;
  carpoolValue?: number;
}

export interface SerializedMetadataVariableDefinitionInterface {
  uuid: string;
  key: string;
  lifetime?: MetadataLifetime;
  initialValue?: number;
  carpoolValue?: number;
}

export interface StoredMetadataVariableInterface
  extends SerializedMetadataVariableDefinitionInterface {
  policy_id: number;
  datetime: Date;
  value: number;
}

export interface MetadataRegistryInterface {
  datetime: Date;
  policy_id: number;
  register(variable: MetadataVariableDefinitionInterface): void;
  export(): Array<SerializedMetadataVariableDefinitionInterface>;
}

export interface SerializedAccessibleMetadataInterface {
  policy_id: number;
  key: string;
  value: number;
  carpoolValue?: number;
}

export interface MetadataAccessorInterface {
  datetime: Date;
  get(uuid: string): number;
  getRaw(uuid: string): SerializedAccessibleMetadataInterface;
  set(uuid: string, data: number): void;
  isEmpty(): boolean;
  export(): Array<SerializedAccessibleMetadataInterface>;
}

export interface SerializedStoredMetadataInterface
  extends SerializedAccessibleMetadataInterface {
  datetime: Date;
}

export interface MetadataStoreInterface {
  load(registry: MetadataRegistryInterface): Promise<MetadataAccessorInterface>;
  save(data: MetadataAccessorInterface): Promise<void>;
  store(
    lifetime: MetadataLifetime,
  ): Promise<Array<SerializedStoredMetadataInterface>>;
}
