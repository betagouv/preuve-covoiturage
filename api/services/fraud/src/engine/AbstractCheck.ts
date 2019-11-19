import { FraudCheckResult, DefaultMetaInterface } from '../interfaces/FraudCheck';
import { CheckInterface } from '../interfaces/CheckInterface';

export abstract class AbstractCheck<R = DefaultMetaInterface> implements CheckInterface {
  abstract async handle(acquisitionId: number, meta?: R | R[]): Promise<FraudCheckResult<R | R[]>>;
}
