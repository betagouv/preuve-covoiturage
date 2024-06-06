import { ConfigInterfaceResolver, provider } from '@/ilos/common/index.ts';
import { ExportTarget } from '../models/Export.ts';

export type Options = {
  uuid: string;
  target: ExportTarget;
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
    uuid: '',
    target: ExportTarget.OPENDATA,
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
      this.options.territory,
      this.options.target,
      this.options.uuid,
    ].filter((i) => !!i)
      .map((s) => String(s))
      .filter((s) => s.length)
      .join('-');
  }
}
