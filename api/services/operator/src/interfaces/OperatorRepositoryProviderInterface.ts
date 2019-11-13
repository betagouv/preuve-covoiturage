import { OperatorInterface } from '../shared/operator/common/interfaces/OperatorInterface';
import { OperatorDbInterface } from '../shared/operator/common/interfaces/OperatorDbInterface';

export interface OperatorRepositoryProviderInterface {
  find(id: number): Promise<OperatorDbInterface>;
  all(): Promise<OperatorDbInterface[]>;
  create(data: OperatorInterface): Promise<OperatorDbInterface>;
  delete(_id: number): Promise<void>;
  patch(id: number, patch: { [k: string]: any }): Promise<OperatorDbInterface>;
  update(params: OperatorInterface): Promise<OperatorDbInterface>;
}

export abstract class OperatorRepositoryProviderInterfaceResolver implements OperatorRepositoryProviderInterface {
  async find(id: number): Promise<OperatorDbInterface> {
    throw new Error();
  }
  async all(): Promise<OperatorDbInterface[]> {
    throw new Error();
  }
  async create(data: OperatorInterface): Promise<OperatorDbInterface> {
    throw new Error();
  }
  async delete(_id: number): Promise<void> {
    throw new Error();
  }
  async patch(id: number, patch: { [k: string]: any }): Promise<OperatorDbInterface> {
    throw new Error();
  }
  async update(params: OperatorInterface): Promise<OperatorDbInterface> {
    throw new Error();
  }
}
