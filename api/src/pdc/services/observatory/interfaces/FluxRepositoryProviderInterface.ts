// eslint-disable-next-line max-len

import type {
  ParamsInterface as GetFluxParamsInterface,
  ResultInterface as GetFluxResultInterface,
} from "@/shared/observatory/flux/getFlux.contract.ts";

import type {
  ParamsInterface as GetEvolFluxParamsInterface,
  ResultInterface as GetEvolFluxResultInterface,
} from "@/shared/observatory/flux/getEvolFlux.contract.ts";

import type {
  ParamsInterface as GetBestFluxParamsInterface,
  ResultInterface as GetBestFluxResultInterface,
} from "@/shared/observatory/flux/getBestFlux.contract.ts";

export type {
  GetBestFluxParamsInterface,
  GetBestFluxResultInterface,
  GetEvolFluxParamsInterface,
  GetEvolFluxResultInterface,
  GetFluxParamsInterface,
  GetFluxResultInterface,
};

export interface FluxRepositoryInterface {
  getFlux(
    params: GetFluxParamsInterface,
  ): Promise<GetFluxResultInterface>;
  getEvolFlux(
    params: GetEvolFluxParamsInterface,
  ): Promise<GetEvolFluxResultInterface>;
  getBestFlux(
    params: GetBestFluxParamsInterface,
  ): Promise<GetBestFluxResultInterface>;
}

export abstract class FluxRepositoryInterfaceResolver
  implements FluxRepositoryInterface {
  async getFlux(
    params: GetFluxParamsInterface,
  ): Promise<GetFluxResultInterface> {
    throw new Error();
  }

  async getEvolFlux(
    params: GetEvolFluxParamsInterface,
  ): Promise<GetEvolFluxResultInterface> {
    throw new Error();
  }

  async getBestFlux(
    params: GetBestFluxParamsInterface,
  ): Promise<GetBestFluxResultInterface> {
    throw new Error();
  }
}
