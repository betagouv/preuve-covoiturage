import type {
  ResultInterface as KeyfiguresResultInterface,
} from "@/pdc/services/observatory/actions/keyfigures/KeyfiguresAction.ts";
import type { KeyFigures as KeyfiguresParamsInterface } from "@/pdc/services/observatory/dto/KeyFigures.ts";

export type { KeyfiguresParamsInterface, KeyfiguresResultInterface };

export interface KeyfiguresRepositoryInterface {
  getKeyfigures(
    params: KeyfiguresParamsInterface,
  ): Promise<KeyfiguresResultInterface>;
}

export abstract class KeyfiguresRepositoryInterfaceResolver implements KeyfiguresRepositoryInterface {
  async getKeyfigures(
    params: KeyfiguresParamsInterface,
  ): Promise<KeyfiguresResultInterface> {
    throw new Error();
  }
}
