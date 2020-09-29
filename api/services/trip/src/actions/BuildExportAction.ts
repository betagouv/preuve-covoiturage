import path from 'path';
import os from 'os';
import fs from 'fs';
import v4 from 'uuid/v4';
import AdmZip from 'adm-zip';
import { get } from 'lodash';
import csvStringify, { Stringifier } from 'csv-stringify';

import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver, ConfigInterfaceResolver } from '@ilos/common';
import { S3StorageProvider } from '@pdc/provider-file';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/buildExport.contract';
import { alias } from '../shared/trip/buildExport.schema';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { signature as notifySignature, ParamsInterface as NotifyParamsInterface } from '../shared/user/notify.contract';
import { ExportTripInterface } from '../interfaces';

interface FlattenTripInterface extends ExportTripInterface {
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
  middlewares: [
    ['validate', alias],
    ['channel.service.only', [handlerConfig.service]],
    ['channel.transport', ['queue']],
  ],
})
export class BuildExportAction extends Action {
  constructor(
    private config: ConfigInterfaceResolver,
    private pg: TripRepositoryProvider,
    private file: S3StorageProvider,
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

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    try {
      const type = get(params, 'from.type', 'opendata');
      const cursor = await this.pg.searchWithCursor(params.query, type);

      let count = 0;

      const filename = path.join(os.tmpdir(), v4()) + '.csv';
      const zipname = filename.replace('.csv', '') + '.zip';
      const fd = await fs.promises.open(filename, 'a');
      const stringifier = await this.getStringifier(fd, type);

      do {
        const results = await cursor(10);
        count = results.length;
        for (const line of results) {
          stringifier.write(this.normalize(line));
        }
      } while (count !== 0);

      stringifier.end();
      await fd.close();

      // ZIP the file
      const zip = new AdmZip();
      zip.addLocalFile(filename);
      zip.writeZip(zipname);

      const { url, password } = await this.file.copy(zipname);
      const email = params.from.email;
      const fullname = params.from.fullname;

      const emailParams = {
        password,
        email,
        fullname,
        template: this.config.get('email.templates.export_csv'),
        templateId: this.config.get('notification.templateIds.export_csv'),
        link: url,
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
          password: '',
          email: params.from.email,
          fullname: params.from.fullname,
          template: this.config.get('email.templates.export_csv_error'),
          templateId: this.config.get('notification.templateIds.export_csv_error'),
          link: '',
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
    }
  }

  protected async getStringifier(fd: fs.promises.FileHandle, type = 'opendata'): Promise<Stringifier> {
    const stringifier = csvStringify({
      delimiter: ';',
      header: true,
      columns: this.getColumns(type),
      cast: { date: (d: Date): string => d.toISOString() },
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

  protected normalize(initialData: ExportTripInterface): FlattenTripInterface {
    const data = {
      ...initialData,
      journey_start_date: initialData.journey_start_datetime.toISOString().split('T')[0],
      journey_start_time: initialData.journey_start_datetime.toISOString().split('T')[1].split('.')[0],
      journey_end_date: initialData.journey_end_datetime.toISOString().split('T')[0],
      journey_end_time: initialData.journey_end_datetime.toISOString().split('T')[1].split('.')[0],
      // distance in kilometers
      journey_distance: initialData.journey_distance / 1000,
      journey_distance_calculated: initialData.journey_distance_calculated / 1000,
      journey_distance_anounced: initialData.journey_distance_anounced / 1000,
      // duration in minutes
      journey_duration: Math.round(initialData.journey_duration / 60),
      journey_duration_calculated: Math.round(initialData.journey_duration_calculated / 60),
      journey_duration_anounced: Math.round(initialData.journey_duration_anounced / 60),
      // financial in euros
      driver_revenue: get(initialData, 'driver_revenue', 0) / 100,
      passenger_contribution: get(initialData, 'passenger_contribution', 0) / 100,
    };

    const driver_incentive_raw = (get(initialData, 'driver_incentive_raw', []) || []).filter((i) => i.type === 'incentive');
    const passenger_incentive_raw = (get(initialData, 'passenger_incentive_raw', []) || []).filter(
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
