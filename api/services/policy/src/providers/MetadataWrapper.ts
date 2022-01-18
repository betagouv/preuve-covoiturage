import { IncentiveMetaInterface } from '../shared/policy/common/interfaces/IncentiveInterface';
import { MetadataWrapperInterface } from '../interfaces';

export class MetadataWrapper implements MetadataWrapperInterface {
  protected dataRegister: Map<string, string>;
  protected data: Map<string, number>;
  protected extraData: Map<string, number>;

  constructor(public readonly policy_id: number = 0, initialData?: [string, number][], extraData?: [string, number][]) {
    this.data = initialData ? new Map(initialData) : new Map();
    this.extraData = extraData ? new Map(extraData) : new Map();
    this.dataRegister = new Map();
  }

  register(uuid: string, key: string): void {
    this.dataRegister.set(uuid, key);
  }

  extraRegister(data: { [k: string]: number }): void {
    for (const key of Object.keys(data)) {
      this.extraData.set(key, data[key]);
    }
  }

  export(): IncentiveMetaInterface {
    const haveExtra = this.dataRegister.size && this.extraData.size;
    return {
      ...Object.fromEntries(this.dataRegister.entries()),
      ...(haveExtra ? { _extra: Object.fromEntries(this.extraData.entries()) } : {}),
    };
  }

  extraGet(key: string): number {
    return this.extraData.get(key);
  }

  has(key: string): boolean {
    return this.data.has(key);
  }

  get(key: string, fallback = 0): number {
    if (this.data.has(key)) {
      return this.data.get(key);
    }
    return fallback;
  }

  set(key: string, data: number): void {
    this.data.set(key, data);
  }

  keys(): string[] {
    return [...this.data.keys()];
  }

  values(): number[] {
    return [...this.data.values()];
  }

  all(): [string, number][] {
    return [...this.data.entries()];
  }
  h;
}
