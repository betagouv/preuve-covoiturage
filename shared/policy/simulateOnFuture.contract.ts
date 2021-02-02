interface IdentityInterface {
  uuid?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  phone_trunc?: string;
  operator_user_id?: string;
  company?: string;
  over_18?: boolean | null;
  travel_pass?: {
    name: string;
    user_id: string;
  }
}

interface PositionInterface {
  datetime: Date;
  lon: number;
  lat: number;
}

interface PersonInterface {
  start: PositionInterface;
  end: PositionInterface;
  distance: number;
  identity: IdentityInterface;
}

interface DriverInterface extends PersonInterface {
  revenue: number;
}

interface PassengerInterface extends PersonInterface {
  seats: number;
  contribution: number;
}

export interface ParamsInterface {
  journey_id: string;
  operator_class: string;  
  operator_id: number;
  passenger?: PassengerInterface;
  driver?: DriverInterface;
}

interface IncentiveInterface {
  index: number;
  amount: number;
  siret: string;
}

export interface ResultInterface {
  journey_id: string;
  passenger: IncentiveInterface[];
  driver: IncentiveInterface[];
}

export const handlerConfig = {
  service: 'campaign',
  method: 'simulateOnFuture',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
