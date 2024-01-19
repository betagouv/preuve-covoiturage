import { ConfigInterfaceResolver, provider } from '@ilos/common';
import { ExportType } from '../repositories/ExportRepository';

export type Options = {
  type: ExportType;
  operator: string | null;
  territory: string | null;
};

export type NameServiceInterface = {
  get(config: Partial<Options>): string;
};

export abstract class NameServiceInterfaceResolver implements NameServiceInterface {
  public get(config: Partial<Options>): string {
    throw new Error('Not implemented');
  }
}

@provider({
  identifier: NameServiceInterfaceResolver,
})
export class NameService {
  protected options: Options = {
    type: ExportType.OPENDATA,
    operator: null,
    territory: null,
  };

  constructor(protected config: ConfigInterfaceResolver) {}

  public get(config: Partial<Options>): string {
    this.options = { ...this.options, ...config };

    const date = new Date().toISOString().slice(0, 10);
    const prefix = this.config.get('workbook.prefix', 'export');

    /* prettier-ignore */
    return [
      prefix,
      date,
      this.options.operator,
      this.options.territory,
      // this.options.type,
    ].filter((i) => !!i).join('-');
  }
}
