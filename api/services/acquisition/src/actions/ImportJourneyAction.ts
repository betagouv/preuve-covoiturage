import parse from 'csv-parse';

import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver, ConfigInterfaceResolver } from '@ilos/common';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';
import { signature as createSignature } from '../shared/acquisition/create.contract';

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
  SingleResultInterface,
} from '../shared/acquisition/import.contract';
import { alias } from '../shared/acquisition/import.schema';
import { CsvRecordInterface, FieldType } from '../interfaces/CsvRecordInterface';
import { csvRecordToCreatePayload } from '../helpers/csvRecordToCreatePayload';

@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({ operator: 'operator.acquisition.create' }),
    ['validate', alias],
  ],
})
export class ImportJourneyAction extends AbstractAction {
  constructor(private kernel: KernelInterfaceResolver, private config: ConfigInterfaceResolver) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const fields: Map<string, FieldType> = this.config.get('csv.fields');
    const columns = [...fields.keys()];
    const parser = parse({
      bom: true,
      columns,
      cast: function (value, context) {
        if (value === '') {
          return undefined;
        }
        const fieldType = fields.get(context.column as string);
        switch (fieldType) {
          case FieldType.String:
            return value;
          case FieldType.Float:
            return parseFloat(value.replace(',', '.'));
          case FieldType.Integer:
            return parseInt(value);
          case FieldType.Boolean:
            return ['false', '0', ''].indexOf(value) === -1;
          default:
            return;
        }
      },
      delimiter: ';',
      encoding: 'utf8',
      escape: '"',
      max_record_size: 1024 * 1024,
      skip_empty_lines: true,
      trim: true,
      skip_lines_with_error: true,
    });

    const result = [];

    parser.on('error', (e) => {
      console.error(e);
      throw e;
    });

    parser.on('skip', (e) => {
      console.info(e);
    });

    parser.write(params.data);
    parser.end();

    for await (const record of parser) {
      const singleResult = await this.mapAndSaveRecord(record, context);
      result.push(singleResult);
    }

    return result;
  }

  protected async mapAndSaveRecord(
    record: Partial<CsvRecordInterface>,
    context: ContextType,
  ): Promise<SingleResultInterface> {
    try {
      const payload = csvRecordToCreatePayload(record);
      const result = await this.kernel.call(createSignature, payload, context);
      return {
        journey_id: record.journey_id,
        success: true,
        created_at: result.created_at,
      };
    } catch (e) {
      return {
        journey_id: record.journey_id,
        success: false,
        error: e.message,
      };
    }
  }
}
