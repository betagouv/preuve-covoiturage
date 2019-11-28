import path from 'path';
import os from 'os';
import fs from 'fs';
import v4 from 'uuid/v4';
import csvStringify from 'csv-stringify';

import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';
import { FileStorageProvider } from '@pdc/provider-file';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/export.contract';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/trip/list.schema';

@handler(handlerConfig)
export class ExportAction extends Action {
  public readonly middlewares: ActionMiddleware[] = [
    ['validate', alias],
    [
      'scopeIt',
      [
        ['trip.list'],
        [
          (params, context) => {
            if (
              'territory_id' in params &&
              params.territory_id.length === 1 &&
              params.territory_id[0] === context.call.user.territory_id
            ) {
              return 'territory.trip.list';
            }
          },
          (params, context) => {
            if (
              'operator_id' in params &&
              params.operator_id.length === 1 &&
              params.operator_id[0] === context.call.user.operator_id
            ) {
              return 'operator.trip.list';
            }
          },
        ],
      ],
    ],
  ];

  constructor(private pg: TripRepositoryProvider, private file: FileStorageProvider) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const start =
      (params && params.date && params.date.start) || new Date(new Date().setFullYear(new Date().getFullYear() - 1));
    const end = (params && params.date && params.date.end) || new Date();

    const cursor = await this.pg.searchWithCursor({
      date: {
        start,
        end,
      },
    });

    let count = 0;

    const filename = path.join(os.tmpdir(), v4());
    const fd = await fs.promises.open(filename, 'a');
    const stringifier = await this.getStringifier(fd);

    do {
      const results = await cursor(10);
      count = results.length;
      for (const line of results) {
        stringifier.write(line);
      }
    } while (count !== 0);

    stringifier.end();
    await fd.close();

    const { url, password } = await this.file.copy(filename);
    return { url, password };
  }

  protected async getStringifier(fd: fs.promises.FileHandle) {
    const stringifier = csvStringify({
      delimiter: ';',
      header: true,
      columns: [
        'journey_id',
        'trip_id',
        'journey_start_datetime',
        'journey_start_lat',
        'journey_start_lon',
        'journey_start_insee',
        'journey_start_postalcode',
        'journey_start_town',
        'journey_start_EPCI',
        'journey_start_country',
        'journey_end_datetime',
        'journey_end_lat',
        'journey_end_lon',
        'journey_end_insee',
        'journey_end_postalcode',
        'journey_end_town',
        'journey_end_EPCI',
        'journey_end_country',
        'journey_distance',
        'journey_duration',
        'driver_card',
        'passenger_card',
        'operator_class',
        'passenger_over_18',
        'passenger_seats',
      ],
    });

    stringifier.on('readable', async () => {
      let row;
      // tslint:disable-next-line: no-conditional-assignment
      while (null !== (row = stringifier.read())) {
        await fd.appendFile(row);
      }
    });

    stringifier.on('error', (err) => {
      console.error(err.message);
    });

    // stringifier.on('finish', async () => {
    //
    // });

    return stringifier;
  }
}
