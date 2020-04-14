import { FraudCheck, FraudCheckComplete, DefaultMetaInterface } from './FraudCheck';

export interface FraudCheckRepositoryProviderInterface {
  findOrCreateFraudCheck<T = DefaultMetaInterface>(acquisitionId: number, method: string): Promise<FraudCheck<T>>;
  updateFraudCheck(fraud: FraudCheck): Promise<void>;
  getScore(acquisitionId: number): Promise<number>;
  getAllCheckByAcquisition(
    acquisitionId: number,
    status?: string[],
    onlyMethod?: boolean,
  ): Promise<(FraudCheckComplete | { method: string })[]>;
  getAllCheckByMethod(
    method: string,
    status?: string[],
    onlyAcquisition?: boolean,
  ): Promise<(FraudCheckComplete | { acquisition_id: number })[]>;
}

export abstract class FraudCheckRepositoryProviderInterfaceResolver implements FraudCheckRepositoryProviderInterface {
  abstract getScore(acquisitionId: number): Promise<number>;
  abstract findOrCreateFraudCheck<T = any>(acquisitionId: number, method: string): Promise<FraudCheck<T>>;
  abstract updateFraudCheck(fraud: FraudCheck): Promise<void>;
  abstract getAllCheckByAcquisition(
    acquisitionId: number,
    status?: string[],
    onlyMethod?: boolean,
  ): Promise<(FraudCheckComplete | { method: string })[]>;

  abstract getAllCheckByMethod(
    method: string,
    status?: string[],
    onlyAcquisition?: boolean,
  ): Promise<(FraudCheckComplete | { acquisition_id: number })[]>;
}
