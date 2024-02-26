/**
 * Make sure the start and end dates are coherent with one another.
 * Fill in with sensible defaults when not provided.
 */

import { PointInterface } from '../shared/common/interfaces/PointInterface';

type Dates = { start_at: Date; end_at: Date };

export type ParamsInterface = Partial<Dates & { positions: PointInterface[] | null }>;

export type ResultsInterface<T> = T & Dates & { positions: PointInterface[] | null };

export interface CreateCastParamsInterface<T> {
  (params: T): ResultsInterface<T>;
}

export interface ConfigInterface {
  get(path: string, defaultValue: number): number;
}

export const createCastParamsHelper = <T>(config: ConfigInterface): CreateCastParamsInterface<T> =>
  function castParams<T extends ParamsInterface>(params: T): ResultsInterface<T> {
    const origin = new Date('2019-01-01T00:00:00+0100'); // Europe/Paris
    const end_at_max = new Date().getTime() - config.get('delays.create.end_at_buffer', 6) * 86400000;

    let { start_at, end_at, positions } = params;

    start_at = 'start_at' in params ? new Date(start_at) : origin;
    end_at = 'end_at' in params ? new Date(end_at) : new Date(end_at_max);
    positions = positions || [];

    // start_at must be older than n days + 1
    if (start_at.getTime() > end_at_max) {
      start_at = new Date(end_at_max - 86400000);
    }

    // end_at must be older than n days
    if (end_at.getTime() > end_at_max) {
      end_at = new Date(end_at_max);
    }

    // start_at must be older than end_at, otherwise we
    // set a 24 hours slot
    if (start_at.getTime() >= end_at.getTime()) {
      start_at = new Date(end_at.getTime() - 86400000);
    }

    return { ...params, start_at, end_at, positions };
  };
