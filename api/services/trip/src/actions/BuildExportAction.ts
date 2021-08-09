import path from 'path';
import os from 'os';
import fs from 'fs';
import { v4 } from 'uuid';
import AdmZip from 'adm-zip';
import { get } from 'lodash';
import csvStringify, { Stringifier } from 'csv-stringify';

import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver } from '@ilos/common';
import { BucketName, S3StorageProvider } from '@pdc/provider-file';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/buildExport.contract';
import { alias } from '../shared/trip/buildExport.schema';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { signature as notifySignature, ParamsInterface as NotifyParamsInterface } from '../shared/user/notify.contract';
import { ExportTripInterface } from '../interfaces';
import { normalize } from '../helpers/normalizeExportDataHelper';

export interface FlattenTripInterface extends ExportTripInterface<string> {
  journey_start_date: string;
  journey_start_time: string;
  journey_end_date: string;
  journey_end_time: string;
  passenger_incentive_1_siret?: string;
  passenger_incentive_1_amount?: number;
  passenger_incentive_2_siret?: string;
  passenger_incentive_2_amount?: number;
  passenger_incentive_3_siret?: string;
  passenger_incentive_3_amount?: number;
  passenger_incentive_4_siret?: string;
  passenger_incentive_4_amount?: number;
  passenger_incentive_rpc_1_siret?: string;
  passenger_incentive_rpc_1_name?: string;
  passenger_incentive_rpc_1_amount?: number;
  passenger_incentive_rpc_2_siret?: string;
  passenger_incentive_rpc_2_name?: string;
  passenger_incentive_rpc_2_amount?: number;
  passenger_incentive_rpc_3_siret?: string;
  passenger_incentive_rpc_3_name?: string;
  passenger_incentive_rpc_3_amount?: number;
  passenger_incentive_rpc_4_siret?: string;
  passenger_incentive_rpc_4_name?: string;
  passenger_incentive_rpc_4_amount?: number;
  driver_incentive_1_siret?: string;
  driver_incentive_1_amount?: number;
  driver_incentive_2_siret?: string;
  driver_incentive_2_amount?: number;
  driver_incentive_3_siret?: string;
  driver_incentive_3_amount?: number;
  driver_incentive_4_siret?: string;
  driver_incentive_4_amount?: number;
  driver_incentive_rpc_1_siret?: string;
  driver_incentive_rpc_1_name?: string;
  driver_incentive_rpc_1_amount?: number;
  driver_incentive_rpc_2_siret?: string;
  driver_incentive_rpc_2_name?: string;
  driver_incentive_rpc_2_amount?: number;
  driver_incentive_rpc_3_siret?: string;
  driver_incentive_rpc_3_name?: string;
  driver_incentive_rpc_3_amount?: number;
  driver_incentive_rpc_4_siret?: string;
  driver_incentive_rpc_4_name?: string;
  driver_incentive_rpc_4_amount?: number;
}
@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service), ['validate', alias]],
})
export class BuildExportAction extends Action {
  constructor(
    private pg: TripRepositoryProvider,
    private file: S3StorageProvider,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  public static readonly baseFields = [
    'journey_id',
    'trip_id',
    'journey_start_datetime',
    'journey_start_date',
    'journey_start_time',
    'journey_start_lon',
    'journey_start_lat',
    'journey_start_insee',
    'journey_start_postalcode',
    'journey_start_department',
    'journey_start_town',
    'journey_start_towngroup',
    'journey_start_country',
    'journey_end_datetime',
    'journey_end_date',
    'journey_end_time',
    'journey_end_lon',
    'journey_end_lat',
    'journey_end_insee',
    'journey_end_postalcode',
    'journey_end_department',
    'journey_end_town',
    'journey_end_towngroup',
    'journey_end_country',
    'driver_card',
    'passenger_card',
    'passenger_over_18',
    'passenger_seats',
    'operator_class',
  ];

  public static readonly financialFields = [
    'passenger_id',
    'passenger_contribution',
    'passenger_incentive_1_siret',
    'passenger_incentive_1_amount',
    'passenger_incentive_2_siret',
    'passenger_incentive_2_amount',
    'passenger_incentive_3_siret',
    'passenger_incentive_3_amount',
    'passenger_incentive_4_siret',
    'passenger_incentive_4_amount',
    'passenger_incentive_rpc_1_siret',
    'passenger_incentive_rpc_1_name',
    'passenger_incentive_rpc_1_amount',
    'passenger_incentive_rpc_2_siret',
    'passenger_incentive_rpc_2_name',
    'passenger_incentive_rpc_2_amount',
    'passenger_incentive_rpc_3_siret',
    'passenger_incentive_rpc_3_name',
    'passenger_incentive_rpc_3_amount',
    'passenger_incentive_rpc_4_siret',
    'passenger_incentive_rpc_4_name',
    'passenger_incentive_rpc_4_amount',
    'driver_id',
    'driver_revenue',
    'driver_incentive_1_siret',
    'driver_incentive_1_amount',
    'driver_incentive_2_siret',
    'driver_incentive_2_amount',
    'driver_incentive_3_siret',
    'driver_incentive_3_amount',
    'driver_incentive_4_siret',
    'driver_incentive_4_amount',
    'driver_incentive_rpc_1_siret',
    'driver_incentive_rpc_1_name',
    'driver_incentive_rpc_1_amount',
    'driver_incentive_rpc_2_siret',
    'driver_incentive_rpc_2_name',
    'driver_incentive_rpc_2_amount',
    'driver_incentive_rpc_3_siret',
    'driver_incentive_rpc_3_name',
    'driver_incentive_rpc_3_amount',
    'driver_incentive_rpc_4_siret',
    'driver_incentive_rpc_4_name',
    'driver_incentive_rpc_4_amount',
  ];

  public static readonly extraFields = {
    opendata: ['journey_distance', 'journey_duration'],
    operator: [
      'journey_distance_anounced',
      'journey_distance_calculated',
      'journey_duration_anounced',
      'journey_duration_calculated',
    ],
    territory: ['journey_distance', 'journey_duration', 'operator'],
    registry: [
      'operator',
      'journey_distance_anounced',
      'journey_distance_calculated',
      'journey_duration_anounced',
      'journey_duration_calculated',
    ],
  };

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    try {
      const type = get(params, 'from.type', 'opendata');
      const cursor = await this.pg.searchWithCursor(
        {
          ...params.query,
          ...(type === 'opendata' ? { status: 'ok' } : {}),
        },
        type,
      );

      let count = 0;

      const filename = path.join(os.tmpdir(), `covoiturage-${v4()}`) + '.csv';
      const zipname = filename.replace('.csv', '') + '.zip';
      const fd = await fs.promises.open(filename, 'a');
      const stringifier = await this.getStringifier(fd, type);

      do {
        const results = await cursor(10);
        count = results.length;
        for (const line of results) {
          stringifier.write(normalize(line, params.format.tz));
        }
      } while (count !== 0);

      stringifier.end();
      await fd.close();

      // ZIP the file
      const zip = new AdmZip();
      zip.addLocalFile(filename);
      zip.writeZip(zipname);

      const { url } = await this.file.copy(BucketName.Export, zipname);

      const email = params.from.email;
      const fullname = params.from.fullname;

      const emailParams = {
        template: 'ExportCSVNotification',
        to: `${fullname} <${email}>`,
        data: {
          fullname,
          action_href: url,
        },
      };

      await this.kernel.notify<NotifyParamsInterface>(notifySignature, emailParams, {
        channel: {
          service: 'trip',
        },
        call: {
          user: {},
        },
      });

      return;
    } catch (e) {
      await this.kernel.notify<NotifyParamsInterface>(
        notifySignature,
        {
          template: 'ExportCSVErrorNotification',
          to: `${params.from.fullname} <${params.from.email}>`,
          data: {
            fullname: params.from.fullname,
          },
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

      throw e;
    }
  }

  protected async getStringifier(fd: fs.promises.FileHandle, type = 'opendata'): Promise<Stringifier> {
    const stringifier = csvStringify({
      delimiter: ';',
      header: true,
      columns: BuildExportAction.getColumns(type),
      cast: {
        date: (d: Date): string => d.toISOString(),
        number: (n: Number): string => n.toString().replace('.', ','),
      },
    });

    stringifier.on('readable', async () => {
      let row;
      while (null !== (row = stringifier.read())) {
        await fd.appendFile(row, { encoding: 'utf8' });
      }
    });

    stringifier.on('error', (err) => {
      console.error(err.message);
    });

    return stringifier;
  }

  public static getColumns(type = 'opendata'): string[] {
    switch (type) {
      case 'territory':
        return [
          ...BuildExportAction.baseFields,
          ...BuildExportAction.extraFields.territory,
          ...BuildExportAction.financialFields,
        ];
      case 'operator':
        return [
          ...BuildExportAction.baseFields,
          ...BuildExportAction.extraFields.operator,
          ...BuildExportAction.financialFields,
        ];
      case 'registry':
        return [
          ...BuildExportAction.baseFields,
          ...BuildExportAction.extraFields.registry,
          ...BuildExportAction.financialFields,
        ];
      default:
        return [...BuildExportAction.baseFields, ...BuildExportAction.extraFields.opendata];
    }
  }
}
