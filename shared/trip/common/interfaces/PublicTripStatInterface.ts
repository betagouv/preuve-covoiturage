import { ApiGraphTimeMode } from './ApiGraphTimeMode';

export interface PublicTripSearchInterface {
  tz?: string;
  group_by?: ApiGraphTimeMode;
  date?: {
    start?: Date;
    end?: Date;
  };
}
