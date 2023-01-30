export interface SingleResultInterface {
  territory: string;
  l_territory: string;
  direction: string;
  distances: [
    {
      dist_classes: string;
      journeys: number;
    },
  ];
}

export type ResultInterface = SingleResultInterface[];

export interface ParamsInterface {
  year: number;
  month: number;
  t: string; //type de territoire selectionné
  code: string; //code insee du territoire observé
  direction?: string;
}

export const handlerConfig = {
  service: 'observatory',
  method: 'journeysByDistances',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
