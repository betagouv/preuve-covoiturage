import { CertificateBaseInterface } from '/shared/certificate/common/interfaces/CertificateBaseInterface.ts';
import { CertificateInterface } from '/shared/certificate/common/interfaces/CertificateInterface.ts';
import { Pagination } from '/shared/certificate/list.contract.ts';

export interface CertificateRepositoryProviderInterface {
  find(): Promise<CertificateInterface[]>;
  findByUuid(uuid: string, operator_id: number | null, withLog: boolean): Promise<CertificateInterface>;
  findByOperatorId(operator_id: number, withLog?: boolean, pagination?: Pagination): Promise<CertificateInterface[]>;
  create(params: CertificateBaseInterface): Promise<CertificateInterface>;
  count(operator_id?: number): Promise<number>;
}

export abstract class CertificateRepositoryProviderInterfaceResolver implements CertificateRepositoryProviderInterface {
  async find(withLog = false, pagination?: Pagination): Promise<CertificateInterface[]> {
    throw new Error('Method not implemented.');
  }
  async findByUuid(uuid: string, operator_id: number | null, withLog = false): Promise<CertificateInterface> {
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
}
