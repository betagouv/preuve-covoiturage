import { FraudCheck, FraudCheckResult, FraudCheckComplete, DefaultMetaInterface } from './FraudCheck';

export interface FraudCheckRepositoryProviderInterface {
  findOrCreateFraudCheck<T = DefaultMetaInterface>(acquisitionId: number, method: string): Promise<FraudCheck<T>>;
  updateFraudCheck(fraud: FraudCheck): Promise<void>;
  getAllCheckByAcquisition(acquisitionId: number, status?: string[], onlyMethod?: boolean): Promise<(FraudCheckComplete|{ method: string })[]>;
  getAllCheckByMethod(method: string, status?: string[], onlyAcquisition?: boolean): Promise<(FraudCheckComplete|{ acquisition_id: number })[]>;
}

export abstract class FraudCheckRepositoryProviderInterfaceResolver implements FraudCheckRepositoryProviderInterface {
  public async findOrCreateFraudCheck<T= any>(acquisitionId: number, method: string): Promise<FraudCheck<T>> {
    throw new Error();
  }

  public async updateFraudCheck(fraud: FraudCheck): Promise<void> {
    throw new Error();
  }

  public async getAllCheckByAcquisition(acquisitionId: number, status: string[] = ['pending', 'error'], onlyMethod = true): Promise<(FraudCheckComplete|{ method: string })[]> {
    throw new Error();   
  }

  public async getAllCheckByMethod(method: string, status: string[] = ['pending', 'error'], onlyAcquisition = true): Promise<(FraudCheckComplete|{ acquisition_id: number })[]> {
    throw new Error();
  }
}
