import path from 'path';
import os from 'os';
import fs from 'fs';
import v4 from 'uuid/v4';
import csvStringify from 'csv-stringify';

import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver } from '@ilos/common';
import { FileStorageProvider } from '@pdc/provider-file';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/buildExport.contract';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { signature as notifySignature, ParamsInterface as NotifyParamsInterface } from '../shared/user/notify.contract';

@handler(handlerConfig)
export class BuildExportAction extends Action {
  public readonly middlewares: ActionMiddleware[] = [
    ['channel.service.only', [handlerConfig.service]],
    ['channel.transport', ['queue']],
  ];

  constructor(
    private pg: TripRepositoryProvider,
    private file: FileStorageProvider,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const cursor = await this.pg.searchWithCursor(params.query);

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
    const email = params.from.email;
    const fullname = params.from.fullname;

    await this.kernel.notify<NotifyParamsInterface>(
      notifySignature,
      {
        password,
        email,
        fullname,
        template: 'export_csv',
        link: url,
      },
      {
        channel: {
          service: 'trip',
        },
        call: {
          user: {},
        },
      },
    );

    return;
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
