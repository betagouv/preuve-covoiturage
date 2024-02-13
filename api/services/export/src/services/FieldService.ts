import { ConfigInterfaceResolver, provider } from '@ilos/common';
import { ExportType } from '../models/Export';
import { FieldFilter, Fields } from '../models/XLSXWriter';

export type FieldServiceInterface = {
  byType(type: ExportType): Partial<Fields>;
};

export abstract class FieldServiceInterfaceResolver implements FieldServiceInterface {
  public byType(type: ExportType): Partial<Fields> {
    throw new Error('Not implemented');
  }
}

@provider({
  identifier: FieldServiceInterfaceResolver,
})
export class FieldService {
  constructor(protected config: ConfigInterfaceResolver) {}

  public byType(type: ExportType): Partial<Fields> {
    const fields = this.config.get('workbook.fields', []) as Fields;
    const filter = this.config.get('workbook.filters', []).find((filter: FieldFilter) => filter.type === type);

    if (!filter) {
      console.warn(`No filter found for type ${type}`);
      return fields;
    }

    return fields.filter((field) => !filter.exclusions.includes(field));
  }
}
