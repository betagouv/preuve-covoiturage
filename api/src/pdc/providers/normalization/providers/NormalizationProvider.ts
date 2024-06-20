import { provider } from "@/ilos/common/index.ts";

import {
  Acquisition,
  NormalizationProviderInterface,
  PayloadV3,
  ResultInterface,
} from "../interfaces/index.ts";
import { NormalizationProviderV3 } from "./NormalizationProviderV3.ts";

@provider()
export class NormalizationProvider
  implements NormalizationProviderInterface<PayloadV3> {
  constructor(protected v3: NormalizationProviderV3) {}

  public async handle(data: Acquisition<PayloadV3>): Promise<ResultInterface> {
    switch (data.api_version) {
      case 3:
        return this.v3.handle(data as Acquisition<PayloadV3>);
      default:
        throw new Error(
          `[normalization] Unknown API version ${data.api_version}`,
        );
    }
  }
}
