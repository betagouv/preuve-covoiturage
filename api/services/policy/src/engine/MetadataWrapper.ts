import { MetaInterface } from '../interfaces/RuleInterfaces';

export class MetadataWrapper implements MetaInterface {
  protected data: Map<string, any>;
  constructor(public readonly id: string, data?: { [k: string]: any }) {
    if (data) {
      this.data = new Map(Object.entries(data));
    } else {
      this.data = new Map();
    }
  }

  get(key: string, fallback: any = undefined): any {
    if (this.data.has(key)) {
      return this.data.get(key);
    }
    return fallback;
  }

  set(key: string, data: any): void {
    this.data.set(key, data);
  }

  all(): { [k: string]: any } {
    // TS node error ? >> Object.fromEntries(this.data.entries());
    return [...this.data.entries()].reduce((k, [key, value]) => {
      k[key] = value;
      return k;
    }, {});
  }
}
