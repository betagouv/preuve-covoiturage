export enum MetadataLifetime {
  Day = 0,
  Month = 1,
  Always = 2,
}

export interface MetadataVariableDefinitionInterface {
  uuid: string;
  key?: string;
  name?: string;
  scope?: string;
  initialValue?: number;
  lifetime?: MetadataLifetime;
}

export interface SerializedMetadataVariableDefinitionInterface {
  uuid: string;
  key: string;
  lifetime?: MetadataLifetime;
  initialValue?: number;
}

export interface StoredMetadataVariableInterface extends SerializedMetadataVariableDefinitionInterface {
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
}

export interface MetadataAccessorInterface {
  datetime: Date;
  get(uuid: string): number;
  set(uuid: string, data: number): void;
  export(): Array<SerializedAccessibleMetadataInterface>;
}

export interface SerializedStoredMetadataInterface extends SerializedAccessibleMetadataInterface {
  datetime: Date;
}

export interface MetadataStoreInterface {
  load(registry: MetadataRegistryInterface): Promise<MetadataAccessorInterface>;
  save(data: MetadataAccessorInterface): Promise<void>;
  store(lifetime: MetadataLifetime): Promise<Array<SerializedStoredMetadataInterface>>;
}
