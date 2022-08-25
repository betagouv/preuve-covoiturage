import { MetadataAccessorInterface, SerializedAccessibleMetadataInterface } from '../../interfaces';

export class MetadataAccessor implements MetadataAccessorInterface {
  constructor(
    public readonly datetime: Date,
    public readonly data: Map<string, SerializedAccessibleMetadataInterface> = new Map(),
  ) {}

  static import(datetime: Date, data: Map<string, SerializedAccessibleMetadataInterface>): MetadataAccessor {
    return new MetadataAccessor(datetime, data);
  }

  export(): Array<SerializedAccessibleMetadataInterface> {
    return [...this.data.values()];
  }

  get(uuid: string): number {
    return this.data.get(uuid).value;
  }

  set(uuid: string, value: number): void {
    const data = this.data.get(uuid);
    this.data.set(uuid, { ...data, value });
  }

  isEmpty(): boolean {
    return this.data.size === 0;
  }
}
