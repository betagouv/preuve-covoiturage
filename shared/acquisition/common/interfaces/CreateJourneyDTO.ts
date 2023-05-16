enum Target {
  Driver = 'driver',
  Passenger = 'passenger',
}

export interface Counterpart {
  amount: number;
  siret: string;
  target: Target;
}

export interface Incentive {
  index: number;
  amount: number;
  siret: string;
}

export interface TimeGeoPoint {
  lat: number;
  lon: number;
  datetime: Date;
}

interface Identity {
  operator_user_id: string;
  identity_key: string;
  travel_pass?: {
    name: string;
    user_id: string;
  };
  phone?: string;
  phone_trunc?: string;
  driving_license?: string;
  over_18?: boolean;
}

interface Payment {
  index: number;
  amount: number;
  type: string;
  siret: string;
}

interface Driver {
  identity: Identity;
  revenue: number;
}

interface Passenger {
  identity: Identity;
  contribution: number;
  payments?: Array<Payment>;
  seats?: number;
}

export interface CreateJourneyDTO {
  incentive_counterparts: Array<Counterpart>;
  operator_journey_id: string;
  operator_class: string;
  incentives: Array<Incentive>;
  start: TimeGeoPoint;
  end: TimeGeoPoint;
  distance: number;
  driver: Driver;
  passenger: Passenger;
  licence_plate?: string;
  operator_trip_id?: string;
}
