interface PersonInterface {
  identity_uuid: string;
  carpool_id: number;
  operator_id: number;
  operator_class: string;
  is_over_18: boolean | null;
  is_driver: boolean;
  has_travel_pass: boolean;
  datetime: Date;
  start_insee: string;
  end_insee: string;
  seats: number;
  duration: number;
  distance: number;
  cost: number;
}

export interface ParamsInterface {
  territories: number[];
  datetime: Date;
  people: PersonInterface[];
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'campaign',
  method: 'apply',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
