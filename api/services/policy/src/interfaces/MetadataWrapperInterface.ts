import { IncentiveMetaInterface } from '../shared/policy/common/interfaces/IncentiveInterface';

export interface MetadataWrapperInterface {
  has(key: string): boolean;
  register(uuid: string, key: string): void;
  extraRegister(data: { [k: string]: number }): void;
  extraGet(key: string): number;
  export(): IncentiveMetaInterface;
  get(key: string, fallback?: number): number;
  set(key: string, data: number): void;
  keys(): string[];
  values(): number[];
  all(): [string, number][];
}
