import { TripStatusType } from '~/core/types/trip/statusType';

export const TRIP_STATUS: TripStatusType[] = ['pending', 'active', 'error'];

export const TRIP_STATUS_FR = {
  pending: 'En cours',
  active: 'Actif',
  error: 'Anomalie',
};
