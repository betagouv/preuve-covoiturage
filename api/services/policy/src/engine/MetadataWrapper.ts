import { MetaInterface } from '../interfaces/RuleInterfaces';

export class MetadataWrapper implements MetaInterface {
  protected data: Map<string, any>;

  constructor(public readonly id: number, public readonly key: string | null, data?: { [k: string]: any }) {
    this.data = data ? new Map(Object.entries(data)) : new Map();
  }

  get signature() {
    return [this.id, this.key];
  }

  get(key: string, fallback?: any): any {
    if (this.data.has(key)) {
      return this.data.get(key);
    }
    return fallback;
  }

  set(key: string, data: any): void {
    this.data.set(key, data);
  }

  keys(): string[] {
    return [...this.data.keys()];
  }

  all(): { [k: string]: any } {
    // TS node error ? >> Object.fromEntries(this.data.entries());
    return [...this.data.entries()].reduce((k, [key, value]) => {
      k[key] = value;
      return k;
    }, {});
  }
}
