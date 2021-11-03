import { MetadataWrapperInterface } from '../interfaces';

export class MetadataWrapper implements MetadataWrapperInterface {
  protected data: Map<string, number>;

  constructor(public readonly policy_id: number = 0, initialData?: [string, number][]) {
    this.data = initialData ? new Map(initialData) : new Map();
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
}
