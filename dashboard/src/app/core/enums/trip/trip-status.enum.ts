export enum TripStatusEnum {
  PENDING = 'pending',
  ACTIVE = 'active',
  ERROR = 'error',
}

export const TRIP_STATUS: TripStatusEnum[] = Object.values(TripStatusEnum);

export const TRIP_STATUS_FR = {
  pending: 'En cours',
  active: 'Actif',
  error: 'Anomalie',
};
