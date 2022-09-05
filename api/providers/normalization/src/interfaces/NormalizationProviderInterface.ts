import { AcquisitionInterface } from '../shared/acquisition/common/interfaces/AcquisitionInterface';
import { ParamsInterface as CrossCheckParamsInterface } from '../shared/carpool/crosscheck.contract';

export type ResultInterface = CrossCheckParamsInterface;
export interface ParamsInterface extends AcquisitionInterface {}

export interface NormalizationProviderInterface {
  handle(params: ParamsInterface): Promise<ResultInterface>;
}
