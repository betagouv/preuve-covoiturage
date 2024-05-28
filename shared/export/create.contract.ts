import { Timezone } from '@pdc/providers/validator';
import { ExportStatus, ExportTarget } from '@pdc/services/export/models/Export';
import { TerritorySelectorsInterface } from '@shared/territory/common/interfaces/TerritoryCodeInterface';

/**
 * Legacy API for the Angular frontend to be replaced.
 * Not all features are supported.
 *
 * @deprecated
 */
export type ParamsInterfaceV2 = {
  tz?: Timezone;
  date: {
    start: Date;
    end: Date;
  };

  // optional operator_id(s) fetch from form (for a territory),
  // fetched context from middleware if operator
  operator_id?: number[];
  geo_selector?: TerritorySelectorsInterface;
};

/**
 * @deprecated
 */
export type ResultInterfaceV2 = any; // TODO convert V3 return to V2 return

export type ParamsInterfaceV3 = {
  tz: Timezone;
  start_at: Date;
  end_at: Date;
  created_by: number;
  recipients?: string[];
  operator_id: number[];
  geo_selector?: TerritorySelectorsInterface;
};

export type ResultInterfaceV3 = {
  uuid: string;
  target: ExportTarget;
  status: ExportStatus;
  start_at: Date;
  end_at: Date;
};

/**
 * @deprecated
 */
export const handlerConfigV2 = {
  service: 'export',
  method: 'createVersionTwo',
} as const;

/**
 * @deprecated
 */
export const signatureV2 = `${handlerConfigV2.service}:${handlerConfigV2.method}` as const;

export const handlerConfigV3 = {
  service: 'export',
  method: 'createVersionThree',
} as const;

export const signatureV3 = `${handlerConfigV3.service}:${handlerConfigV3.method}` as const;
