import { Interfaces } from '@pdc/core';

export type Model = any;

export interface ParentRepositoryProviderInterface extends Interfaces.ProviderInterface {
  find(id: string): Promise<Model>;
  all(): Promise<Model[]>;
  create(data: Model): Promise<Model>;
  delete(data: Model): Promise<void>;
  update(data: Model, patch?: any): Promise<Model>;
  clear(): Promise<void>;
}

export abstract class ParentRepositoryProviderInterfaceResolver implements ParentRepositoryProviderInterface {
  async boot(): Promise<void> {
    throw new Error();
  }

  async find(id: string): Promise<Model> {
    throw new Error();
  }

  async all(): Promise<Model[]> {
    throw new Error();
  }

  async create(data: Model): Promise<Model> {
    throw new Error();
  }

  async delete(data: Model): Promise<void> {
    throw new Error();
  }

  async update(data: Model, patch?: any): Promise<Model> {
    throw new Error();
  }

  async clear(): Promise<void> {
    throw new Error();
  }
}
