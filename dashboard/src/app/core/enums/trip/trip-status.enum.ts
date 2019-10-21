export enum TripStatusEnum {
  PENDING = 'pending',
  ACTIVE = 'active',
  LOCKED = 'locked',
  ERROR = 'error',
}

export const TRIP_STATUS: TripStatusEnum[] = Object.values(TripStatusEnum);

export const TRIP_STATUS_FR = {
  pending: 'En cours',
  active: 'Actif',
  locked: 'Actif',
  error: 'Anomalie',
};
