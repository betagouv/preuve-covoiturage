export interface HonorStatInterface {
  type: 'public' | 'limited';
  count: number;
}

export interface DataSetInterface {
  label: string;
  data: number[];
}

export interface ResultInterface {
  labels: string[];
  datasets: DataSetInterface[];
  count: {
    total: number;
    public: number;
    limited: number;
  };
}

export interface ParamsInterface {
  tz?: string;
}

export const handlerConfig = {
  service: 'honor',
  method: 'stats',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;