export type ParamsInterface = void;

export type ResultInterface = {
  pipeline: {
    acquired: number;
    acquired_failed: number;
    acquired_failed_ratio: number;
    carpools: number;
    missing: number;
    missing_ratio: number;
    carpool_ratio: number;
  };
};

export const handlerConfig = {
  service: 'monitoring',
  method: 'journeysstats',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
