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

type IdentityInterfaceV2 = CommonIdentityInterface;

interface IdentityInterfaceV3 extends CommonIdentityInterface {
  identity_key: string;
  operator_user_id: string;
}

interface PositionInterface {
  datetime: Date;
  lon: number;
  lat: number;
}

interface PersonInterfaceV2 {
  start: PositionInterface;
  end: PositionInterface;
  distance: number;
  identity: IdentityInterfaceV2;
}

interface DriverInterfaceV2 extends PersonInterfaceV2 {
  revenue: number;
}

interface DriverInterfaceV3 {
  revenue: number;
  identity: IdentityInterfaceV3;
}

interface PassengerInterfaceV2 extends PersonInterfaceV2 {
  seats: number;
  contribution: number;
}

interface PassengerInterfaceV3 {
  seats: number;
  contribution: number;
  identity: IdentityInterfaceV3;
}

export interface ParamsInterfaceV2 {
  api_version: 'v2';
  journey_id: string;
  operator_class: string;
  operator_id: number;
  passenger?: PassengerInterfaceV2;
  driver?: DriverInterfaceV2;
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

export type ParamsInterface = ParamsInterfaceV2 | ParamsInterfaceV3;

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
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
