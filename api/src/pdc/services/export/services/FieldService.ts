import { ConfigInterfaceResolver, provider } from '@/ilos/common/index.ts';
import { ExportTarget } from '../models/Export.ts';
import { FieldFilter, Fields } from '../models/XLSXWriter.ts';

export type FieldServiceInterface = {
  byTarget(type: ExportTarget): Partial<Fields>;
};

export abstract class FieldServiceInterfaceResolver implements FieldServiceInterface {
  public byTarget(type: ExportTarget): Partial<Fields> {
    throw new Error('Not implemented');
  }
}

@provider({
  identifier: FieldServiceInterfaceResolver,
})
export class FieldService {
  constructor(protected config: ConfigInterfaceResolver) {}

  public byTarget(target: ExportTarget): Partial<Fields> {
    const fields = this.config.get('workbook.fields', []) as Fields;
    const filter = this.config.get('workbook.filters', []).find((filter: FieldFilter) => filter.target === target);

    if (!filter) {
      console.warn(`No filter found for target ${target}`);
      return fields;
    }

    return fields.filter((field) => !filter.exclusions.includes(field));
  }
}
