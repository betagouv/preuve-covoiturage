import { MetadataAccessorInterface } from '../interfaces';

export class MetadataAccessor implements MetadataAccessorInterface {
  constructor(public readonly datetime: Date, public readonly data: Map<string, number> = new Map()) {}

  static import(datetime: Date, data: Map<string, number>): MetadataAccessor {
    return new MetadataAccessor(datetime, data);
  }

  export(): Record<string, number> {
    return Object.fromEntries(this.data.entries());
  }

  get(uuid: string): number {
    return this.data.get(uuid);
  }

  set(uuid: string, value: number): void {
    this.data.set(uuid, value);
  }
}
