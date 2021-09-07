import { MetaInterface } from './MetaInterface';

export interface MetadataProviderInterface {
  get(id: number, keys?: string[], datetime?: Date): Promise<MetaInterface>;
  set(id: number, metadata: MetaInterface, date: Date): Promise<void>;
}

export abstract class MetadataProviderInterfaceResolver implements MetadataProviderInterface {
  async get(id: number, keys?: string[], datetime?: Date): Promise<MetaInterface> {
    throw new Error();
  }

  async set(id: number, metadata: MetaInterface, date: Date): Promise<void> {
    throw new Error();
  }

  async wayback(policyId: number, from: Date): Promise<void> {
    throw new Error();
  }
}
