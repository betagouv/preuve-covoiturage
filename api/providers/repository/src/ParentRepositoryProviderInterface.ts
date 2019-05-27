import { Interfaces } from '@pdc/core';
import { ObjectId } from '@pdc/provider-mongo';

export type Model = any;

export interface ParentRepositoryProviderInterface extends Interfaces.ProviderInterface {
  find(id: string): Promise<Model>;
  all(): Promise<Model[]>;
  create(data: Model): Promise<Model>;
  delete(data: Model | { _id: string }): Promise<void>;
  update(data: Model, patch?: any): Promise<Model>;
  patch(id: ObjectId | string, patch?: any): Promise<Model>;
  clear(): Promise<void>;
  updateOrCreate(data: Model): Promise<Model>;
  getDriver(): Promise<any>;
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

  async delete(data: Model | { _id: string }): Promise<void> {
    throw new Error();
  }

  async update(data: Model, patch?: any): Promise<Model> {
    throw new Error();
  }
  async patch(id: ObjectId | string, patch?: any): Promise<Model> {
    throw new Error();
  }

  async clear(): Promise<void> {
    throw new Error();
  }

  async updateOrCreate(data: Model): Promise<Model> {
    throw new Error();
  }

  async getDriver(): Promise<any> {
    throw new Error();
  }
}
