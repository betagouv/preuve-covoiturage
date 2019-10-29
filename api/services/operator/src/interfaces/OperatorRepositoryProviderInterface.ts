import { OperatorInterface } from '../shared/operator/common/interfaces/OperatorInterface';

export interface OperatorRepositoryProviderInterface {
  find(id: string): Promise<OperatorInterface>;
  all(): Promise<OperatorInterface[]>;
  create(data: OperatorInterface): Promise<OperatorInterface>;
  delete(_id: string): Promise<void>;
  patch(id: string, patch: { [k: string]: any }): Promise<OperatorInterface>;
  update(params: OperatorInterface): Promise<OperatorInterface>;
}

export abstract class OperatorRepositoryProviderInterfaceResolver implements OperatorRepositoryProviderInterface {
  async find(id: string): Promise<OperatorInterface> {
    throw new Error();
  }
  async all(): Promise<OperatorInterface[]> {
    throw new Error();
  }
  async create(data: OperatorInterface): Promise<OperatorInterface> {
    throw new Error();
  }
  async delete(_id: string): Promise<void> {
    throw new Error();
  }
  async patch(id: string, patch: { [k: string]: any }): Promise<OperatorInterface> {
    throw new Error();
  }
  async update(params: OperatorInterface): Promise<OperatorInterface> {
    throw new Error();
  }
}
