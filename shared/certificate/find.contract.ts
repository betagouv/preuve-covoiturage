import { ResultRowInterface } from './common/interfaces/ResultRowInterface';

export interface ParamsInterface {
  uuid: string;
  operator_id: number;
}

// export interface ResultInterface extends CertificateInterface {}
export type ResultInterface = ResultRowInterface;

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'certificate',
  method: 'find',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
