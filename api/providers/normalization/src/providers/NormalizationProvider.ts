import { provider } from '@ilos/common';

import { Acquisition, NormalizationProviderInterface, PayloadV2, PayloadV3, ResultInterface } from '../interfaces';
import { NormalizationProviderV2 } from './NormalizationProviderV2';
import { NormalizationProviderV3 } from './NormalizationProviderV3';

@provider()
export class NormalizationProvider implements NormalizationProviderInterface<PayloadV2 | PayloadV3> {
  constructor(protected v2: NormalizationProviderV2, protected v3: NormalizationProviderV3) {}

  public async handle(data: Acquisition<PayloadV2 | PayloadV3>): Promise<ResultInterface> {
    switch (data.api_version) {
      case 2:
        return this.v2.handle(data as Acquisition<PayloadV2>);
      case 3:
        return this.v3.handle(data as Acquisition<PayloadV3>);
      default:
        throw new Error(`[normalization] Unknown API version ${data.api_version}`);
    }
  }
}
