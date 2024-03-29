export enum TripStatusEnum {
  // PENDING = 'pending',
  OK = 'ok',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
  FRAUD = 'fraudcheck_error',
}

export const TRIP_STATUS: TripStatusEnum[] = Object.values(TripStatusEnum);

export const TRIP_STATUS_FR = {
  // pending: 'En cours',
  ok: 'Ok',
  expired: 'Expiré',
  canceled: 'Annulé',
  fraud: 'Anomalie',
};
