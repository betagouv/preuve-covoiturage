import path from 'path';
import os from 'os';
import fs from 'fs';
import { v4 } from 'uuid';
import AdmZip from 'adm-zip';
import { get } from 'lodash';
import csvStringify, { Stringifier } from 'csv-stringify';
import { format, utcToZonedTime } from 'date-fns-tz';

import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { Action } from '@ilos/core';
import {
  handler,
  ContextType,
  InitHookInterface,
  ConfigInterfaceResolver,
  KernelInterfaceResolver,
} from '@ilos/common';
import { BucketName, S3StorageProvider } from '@pdc/provider-file';

import {
  signature,
  handlerConfig,
  ParamsInterface,
  ResultInterface,
  QueryInterface,
  FormatInterface,
} from '../shared/trip/buildExport.contract';
import { alias } from '../shared/trip/buildExport.schema';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { ExportTripInterface } from '../interfaces';
import { getOpenDataExportName } from '../helpers/getOpenDataExportName';

interface FlattenTripInterface extends ExportTripInterface<string> {
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
export class BuildExportAction extends Action implements InitHookInterface {
  constructor(
    private pg: TripRepositoryProvider,
    private file: S3StorageProvider,
    private config: ConfigInterfaceResolver,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  public readonly baseFields = [
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

  public readonly financialFields = [
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

  public readonly extraFields = {
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

  async init(): Promise<void> {
    /**
     * Activate open data export in production only
     */
    if (this.config.get('app.environment') === 'production') {
      await this.kernel.notify<ParamsInterface>(
        signature,
        {
          type: 'opendata',
        },
        {
          call: {
            user: {},
          },
          channel: {
            service: handlerConfig.service,
            metadata: {
              repeat: {
                cron: '0 5 6 * *',
              },
              jobId: 'trip.open_data_export',
            },
          },
        },
      );
    }
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const type = get(params, 'type', 'opendata');
    const cursor = await this.pg.searchWithCursor(this.castQueryParams(type, params), type);

    let count = 0;

    const { filename, tz } = this.castFormat(type, params);

    const filepath = path.join(os.tmpdir(), filename);
    const zipname = filepath.replace('.csv', '') + '.zip';
    const fd = await fs.promises.open(filepath, 'a');
    const stringifier = await this.getStringifier(fd, type);

    do {
      const results = await cursor(10);
      count = results.length;
      for (const line of results) {
        stringifier.write(this.normalize(line, tz));
      }
    } while (count !== 0);

    stringifier.end();
    await fd.close();

    // ZIP the file
    const zip = new AdmZip();
    zip.addLocalFile(filepath);
    zip.writeZip(zipname);

    const fileKey = await this.file.upload(BucketName.Export, zipname, filename);

    return fileKey;
  }

  protected castQueryParams(type: string, params: ParamsInterface): QueryInterface & { status?: string } {
    if (type !== 'opendata') {
      return params.query;
    }

    const endDate = new Date();
    endDate.setDate(1);
    endDate.setHours(0, 0, 0, -1);
    const startDate = new Date(endDate.valueOf());
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    return {
      date: {
        start: startDate,
        end: endDate,
        ...params.query.date,
      },
      ...params.query,
      status: 'ok',
    };
  }

  protected castFormat(type: string, params: ParamsInterface): Required<FormatInterface> {
    return {
      tz: params.format?.tz ?? 'Europe/Paris',
      filename:
        params.format?.filename ?? type === 'opendata' ? getOpenDataExportName('csv') : `covoiturage-${v4()}.csv`,
    };
  }

  protected async getStringifier(fd: fs.promises.FileHandle, type = 'opendata'): Promise<Stringifier> {
    const stringifier = csvStringify({
      delimiter: ';',
      header: true,
      columns: this.getColumns(type),
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

  protected getColumns(type = 'opendata'): string[] {
    switch (type) {
      case 'territory':
        return [...this.baseFields, ...this.extraFields.territory, ...this.financialFields];
      case 'operator':
        return [...this.baseFields, ...this.extraFields.operator, ...this.financialFields];
      case 'registry':
        return [...this.baseFields, ...this.extraFields.registry, ...this.financialFields];
      default:
        return [...this.baseFields, ...this.extraFields.opendata];
    }
  }

  protected normalize(src: ExportTripInterface, timeZone: string): FlattenTripInterface {
    const jsd = utcToZonedTime(src.journey_start_datetime, timeZone);
    const jed = utcToZonedTime(src.journey_end_datetime, timeZone);

    const data = {
      ...src,

      // format and convert to user timezone
      journey_start_datetime: format(jsd, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone }),
      journey_start_date: format(jsd, 'yyyy-MM-dd', { timeZone }),
      journey_start_time: format(jsd, 'HH:mm:ss', { timeZone }),

      journey_end_datetime: format(jed, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone }),
      journey_end_date: format(jed, 'yyyy-MM-dd', { timeZone }),
      journey_end_time: format(jed, 'HH:mm:ss', { timeZone }),

      // distance in meters
      journey_distance: src.journey_distance,
      journey_distance_calculated: src.journey_distance_calculated,
      journey_distance_anounced: src.journey_distance_anounced,

      // duration in minutes
      journey_duration: Math.round(src.journey_duration / 60),
      journey_duration_calculated: Math.round(src.journey_duration_calculated / 60),
      journey_duration_anounced: Math.round(src.journey_duration_anounced / 60),

      // financial in euros
      driver_revenue: get(src, 'driver_revenue', 0) / 100,
      passenger_contribution: get(src, 'passenger_contribution', 0) / 100,
    };

    const driver_incentive_raw = (get(src, 'driver_incentive_raw', []) || []).filter((i) => i.type === 'incentive');
    const passenger_incentive_raw = (get(src, 'passenger_incentive_raw', []) || []).filter(
      (i) => i.type === 'incentive',
    );

    for (let i = 0; i < 4; i++) {
      // normalize incentive in euro
      const id = i + 1;
      data[`passenger_incentive_${id}_siret`] = get(passenger_incentive_raw, `${i}.siret`);
      data[`passenger_incentive_${id}_amount`] = get(passenger_incentive_raw, `${i}.amount`, 0) / 100;
      data[`passenger_incentive_rpc_${id}_siret`] = get(data, `passenger_incentive_rpc_raw.${i}.siret`);
      data[`passenger_incentive_rpc_${id}_name`] = get(data, `passenger_incentive_rpc_raw.${i}.policy_name`);
      data[`passenger_incentive_rpc_${id}_amount`] = get(data, `passenger_incentive_rpc_raw.${i}.amount`, 0) / 100;
      data[`driver_incentive_${id}_siret`] = get(driver_incentive_raw, `${i}.siret`);
      data[`driver_incentive_${id}_amount`] = get(driver_incentive_raw, `${i}.amount`, 0) / 100;
      data[`driver_incentive_rpc_${id}_siret`] = get(data, `driver_incentive_rpc_raw.${i}.siret`);
      data[`driver_incentive_rpc_${id}_name`] = get(data, `driver_incentive_rpc_raw.${i}.policy_name`);
      data[`driver_incentive_rpc_${id}_amount`] = get(data, `driver_incentive_rpc_raw.${i}.amount`, 0) / 100;
    }

    return data;
  }
}
