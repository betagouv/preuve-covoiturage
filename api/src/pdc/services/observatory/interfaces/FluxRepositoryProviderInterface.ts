// eslint-disable-next-line max-len
import type {
  ResultInterface as BestFluxResultInterface,
} from "@/pdc/services/observatory/actions/flux/BestFluxAction.ts";
import type {
  ResultInterface as EvolFluxResultInterface,
} from "@/pdc/services/observatory/actions/flux/EvolFluxAction.ts";
import type { ResultInterface as FluxResultInterface } from "@/pdc/services/observatory/actions/flux/FluxAction.ts";
import type { BestFlux as BestFluxParamsInterface } from "@/pdc/services/observatory/dto/flux/BestFlux.ts";
import type { EvolFlux as EvolFluxParamsInterface } from "@/pdc/services/observatory/dto/flux/EvolFlux.ts";
import type { Flux as FluxParamsInterface } from "@/pdc/services/observatory/dto/flux/Flux.ts";

export type {
  BestFluxParamsInterface,
  BestFluxResultInterface,
  EvolFluxParamsInterface,
  EvolFluxResultInterface,
  FluxParamsInterface,
  FluxResultInterface,
};

export interface FluxRepositoryInterface {
  getFlux(
    params: FluxParamsInterface,
  ): Promise<FluxResultInterface>;
  getEvolFlux(
    params: EvolFluxParamsInterface,
  ): Promise<EvolFluxResultInterface>;
  getBestFlux(
    params: BestFluxParamsInterface,
  ): Promise<BestFluxResultInterface>;
}

export abstract class FluxRepositoryInterfaceResolver implements FluxRepositoryInterface {
  async getFlux(
    params: FluxParamsInterface,
  ): Promise<FluxResultInterface> {
    throw new Error();
  }

  async getEvolFlux(
    params: EvolFluxParamsInterface,
  ): Promise<EvolFluxResultInterface> {
    throw new Error();
  }

  async getBestFlux(
    params: BestFluxParamsInterface,
  ): Promise<BestFluxResultInterface> {
    throw new Error();
  }
}
