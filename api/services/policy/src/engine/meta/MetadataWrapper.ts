import { MetaInterface } from '../interfaces/MetaInterface';

export class MetadataWrapper implements MetaInterface {
  protected data: Map<string, number>;

  constructor(public readonly policy_id: number, data?: [string, number][]) {
    this.data = data ? new Map(data) : new Map();
  }

  get(key: string, fallback: number = 0): number {
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
}

export class FakeMetadataWrapper implements MetaInterface {
  protected data: Map<string, number> = new Map();

  get(key: string, fallback: number = 0): number {
    if (!this.data.has(key)) {
      this.data.set(key, fallback);
    }
    return this.data.get(key);
  }

  set(_key: string, _data: number): void {
    throw new Error();
  }

  keys(): string[] {
    return [...this.data.keys()];
  }
  
  values(): number[] {
    return [...this.data.values()];
  }
}