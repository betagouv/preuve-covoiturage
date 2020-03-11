export type ParamsInterface = void;

export type ResultInterface = {
  pipeline: {
    acquired: number;
    carpools: number;
    missing: number;
    missing_ratio: number;
  };
};

export const handlerConfig = {
  service: 'monitoring',
  method: 'journeysstats',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
