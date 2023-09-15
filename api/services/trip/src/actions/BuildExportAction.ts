import { ContextType, handler, KernelInterfaceResolver } from '@ilos/common';
import { Action } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { BucketName, S3StorageProvider } from '@pdc/provider-storage';
import AdmZip from 'adm-zip';
import fs from 'fs';
import { get } from 'lodash';
import os from 'os';
import path from 'path';
import { endOfPreviousMonthDate, startOfPreviousMonthDate } from '../helpers/getDefaultDates';
import { ExportTripInterface } from '../interfaces';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { PgCursorHandler } from '../shared/common/PromisifiedPgCursor';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/buildExport.contract';
import { alias } from '../shared/trip/buildExport.schema';
import { TerritoryTripsInterface } from '../shared/trip/common/interfaces/TerritoryTripsInterface';
import { TripSearchInterface } from '../shared/trip/common/interfaces/TripSearchInterface';
import {
  ParamsInterface as PublishOpenDataParamsInterface,
  signature as publishOpenDataSignature,
} from '../shared/trip/publishOpenData.contract';
import { ExportType } from '../shared/trip/sendExport.contract';
import { BuildFile } from './file/BuildFile';

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
  has_incentive?: boolean;
}
@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service), ['validate', alias]],
})
export class BuildExportAction extends Action {
  constructor(
    private tripRepository: TripRepositoryProvider,
    private fileProvider: S3StorageProvider,
    private kernel: KernelInterfaceResolver,
    private buildFile: BuildFile,
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

  public static readonly opendataFields = [
    'journey_id',
    'trip_id',
    'journey_start_datetime',
    'journey_start_date',
    'journey_start_time',
    'journey_start_lon',
    'journey_start_lat',
    'journey_start_insee',
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
    'journey_end_department',
    'journey_end_town',
    'journey_end_towngroup',
    'journey_end_country',
    'passenger_seats',
    'operator_class',
    'journey_distance',
    'journey_duration',
    'has_incentive',
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
    operator: [
      'journey_distance_anounced',
      'journey_distance_calculated',
      'journey_duration_anounced',
      'journey_duration_calculated',
      'operator_journey_id',
      'operator_passenger_id',
      'operator_driver_id',
      'status',
    ],
    territory: [
      'journey_distance',
      'journey_duration',
      'operator',
      'operator_journey_id',
      'operator_passenger_id',
      'operator_driver_id',
    ],
    registry: [
      'operator',
      'journey_distance_anounced',
      'journey_distance_calculated',
      'journey_duration_anounced',
      'journey_duration_calculated',
      'operator_journey_id',
      'operator_passenger_id',
      'operator_driver_id',
      'status',
    ],
  };

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const type = get(params, 'type', 'export');
    const queryParams: TripSearchInterface = this.getDefaultQueryParams(params);
    const isOpendata: boolean = this.isOpendata(type);

    let excluded_territories: TerritoryTripsInterface[];

    if (isOpendata) {
      excluded_territories = await this.tripRepository.getOpendataExcludedTerritories(queryParams);
      this.addExcludedTerritoriesToQueryParams(excluded_territories, queryParams);
    }

    const cursor: PgCursorHandler<ExportTripInterface> = await this.tripRepository.searchWithCursor(queryParams, type);
    const filepath: string = await this.buildFile.buildCsvFromCursor(cursor, params, queryParams.date.end, isOpendata);
    return this.handleCSVExport(isOpendata, filepath, queryParams, excluded_territories);
  }

  private async handleCSVExport(
    isOpenData: boolean,
    filepath: string,
    queryParams,
    excluded_territories,
  ): Promise<string> {
    if (isOpenData) {
      return this.processOpendataExport(filepath, queryParams, excluded_territories);
    } else {
      return this.processOtherTypeExport(filepath);
    }
  }

  private async processOtherTypeExport(filepath: string): Promise<string> {
    const filename: string = path.parse(filepath).base;
    const { zippath, zipname } = this.zip(filename, filepath);
    const fileKey = await this.fileProvider.upload(BucketName.Export, zippath, zipname);
    this.removeFromFs(filepath);
    this.removeFromFs(zippath);
    return fileKey;
  }

  private async processOpendataExport(filepath: string, queryParams: any, excluded_territories: any): Promise<string> {
    await this.publishOpendataExport(queryParams, excluded_territories, filepath);
    this.removeFromFs(filepath);
    return filepath;
  }

  private zip(filename: string, filepath: string) {
    const zipname = `${filename.replace('.csv', '')}.zip`;
    const zippath = path.join(os.tmpdir(), zipname);
    const zip = new AdmZip();
    zip.addLocalFile(filepath);
    zip.writeZip(zippath);
    return { zippath, zipname };
  }

  private removeFromFs(filepath: string) {
    fs.unlinkSync(filepath);
  }

  private addExcludedTerritoriesToQueryParams(
    excluded_territories: TerritoryTripsInterface[],
    queryParam: TripSearchInterface,
  ) {
    if (excluded_territories.length !== 0) {
      queryParam.excluded_start_geo_code = excluded_territories
        .filter((t) => t.start_geo_code)
        .map((t) => t.start_geo_code);
      queryParam.excluded_end_geo_code = excluded_territories.filter((t) => t.end_geo_code).map((t) => t.end_geo_code);
    }
  }

  private isOpendata(type: ExportType): boolean {
    return type === 'opendata';
  }

  private publishOpendataExport(
    tripSearchQueryParam: TripSearchInterface,
    excluded_territories: TerritoryTripsInterface[],
    filepath: string,
  ) {
    return this.kernel.call<PublishOpenDataParamsInterface>(
      publishOpenDataSignature,
      {
        filepath,
        tripSearchQueryParam,
        excludedTerritories: excluded_territories,
      },
      {
        call: {
          user: {},
          metadata: {},
        },
        channel: {
          service: handlerConfig.service,
        },
      },
    );
  }

  private getDefaultQueryParams(params: ParamsInterface): TripSearchInterface {
    const endDate = endOfPreviousMonthDate(params.format?.tz);
    const startDate = startOfPreviousMonthDate(endDate, params.format?.tz);

    return {
      date: {
        start: startDate,
        end: endDate,
        ...params.query?.date,
      },
      ...params.query,
      ...(params.type !== 'operator' && params.type !== 'registry' && { status: 'ok' }),
    };
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
        return [...BuildExportAction.opendataFields];
    }
  }
}
