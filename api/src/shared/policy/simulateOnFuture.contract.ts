interface CommonIdentityInterface {
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
  };
}

interface IdentityInterfaceV3 extends CommonIdentityInterface {
  identity_key: string;
  operator_user_id: string;
}

interface PositionInterface {
  datetime: Date;
  lon: number;
  lat: number;
}

interface DriverInterfaceV3 {
  revenue: number;
  identity: IdentityInterfaceV3;
}

interface PassengerInterfaceV3 {
  seats: number;
  contribution: number;
  identity: IdentityInterfaceV3;
}

export interface ParamsInterfaceV3 {
  api_version: 'v3';
  operator_id: number;
  operator_class: string;
  start: PositionInterface;
  end: PositionInterface;
  distance: number;
  driver: DriverInterfaceV3;
  passenger: PassengerInterfaceV3;
}

export type ParamsInterface = ParamsInterfaceV3;

interface IncentiveInterface {
  index: number;
  amount: number;
  siret: string;
}

export interface ResultInterface {
  incentives: IncentiveInterface[];
}

export const handlerConfig = {
  service: 'campaign',
  method: 'simulateOnFuture',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
