import { FraudCheckResult } from '../interfaces/FraudCheck';
import { CheckInterface } from '../interfaces/CheckInterface';

export abstract class AbstractCheck<R = any> implements CheckInterface {
  abstract async handle(acquisitionId: number, meta?: R): Promise<FraudCheckResult<R>>;
}
