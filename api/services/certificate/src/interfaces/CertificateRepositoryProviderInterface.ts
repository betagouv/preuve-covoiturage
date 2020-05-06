import { CertificateInterface } from '../shared/certificate/common/interfaces/CertificateInterface';
import { CertificateBaseInterface } from '../shared/certificate/common/interfaces/CertificateBaseInterface';
import { CertificateMetaInterface } from '../shared/certificate/common/interfaces/CertificateMetaInterface';
import { CertificateAccessLogInterface } from '../shared/certificate/common/interfaces/CertificateAccessLogInterface';
import { Pagination } from '../shared/certificate/list.contract';

export interface CertificateRepositoryProviderInterface {
  find(): Promise<CertificateInterface[]>;
  findByUuid(uuid: string, withLog: boolean): Promise<CertificateInterface>;
  findById(_id: string, withLog: boolean): Promise<CertificateInterface>;
  findByOperatorId(operator_id: number, withLog?: boolean, pagination?: Pagination): Promise<CertificateInterface[]>;
  create(params: CertificateBaseInterface): Promise<CertificateInterface>;
  patchMeta(_id: string, params: CertificateMetaInterface): Promise<CertificateInterface>;
  logAccess(_id: string, params: CertificateAccessLogInterface): Promise<void>;
  count(operator_id?: number): Promise<number>;
}

export abstract class CertificateRepositoryProviderInterfaceResolver implements CertificateRepositoryProviderInterface {
  async find(withLog = false, pagination?: Pagination): Promise<CertificateInterface[]> {
    throw new Error('Method not implemented.');
  }
  async findByUuid(uuid: string, withLog = false): Promise<CertificateInterface> {
    throw new Error('Method not implemented.');
  }
  async findById(_id: string, withLog = false): Promise<CertificateInterface> {
    throw new Error('Method not implemented.');
  }
  async count(operator_id?: number): Promise<number> {
    throw new Error('Method not implemented.');
  }
  async findByOperatorId(
    operator_id: number,
    withLog = false,
    pagination?: Pagination,
  ): Promise<CertificateInterface[]> {
    throw new Error('Method not implemented.');
  }
  async create(params: CertificateBaseInterface): Promise<CertificateInterface> {
    throw new Error('Method not implemented.');
  }
  async patchMeta(_id: string, params: CertificateMetaInterface): Promise<CertificateInterface> {
    throw new Error('Method not implemented.');
  }
  async logAccess(_id: string, params: CertificateAccessLogInterface): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
