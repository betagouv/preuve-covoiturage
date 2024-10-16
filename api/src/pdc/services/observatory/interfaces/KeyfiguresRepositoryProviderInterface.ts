import type {
  ParamsInterface as KeyfiguresParamsInterface,
  ResultInterface as KeyfiguresResultInterface,
} from "@/shared/observatory/keyfigures/keyfigures.contract.ts";

export type {
  KeyfiguresParamsInterface,
  KeyfiguresResultInterface,
};

export interface KeyfiguresRepositoryInterface {
  getKeyfigures(
    params: KeyfiguresParamsInterface,
  ): Promise<KeyfiguresResultInterface>;
}

export abstract class KeyfiguresRepositoryInterfaceResolver
  implements KeyfiguresRepositoryInterface {
  async getKeyfigures(
    params: KeyfiguresParamsInterface,
  ): Promise<KeyfiguresResultInterface> {
    throw new Error();
  }
}
