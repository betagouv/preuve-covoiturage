import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { TripSearchInterface } from '~/core/entities/api/shared/trip/common/interfaces/TripSearchInterface';

export interface FilterInterface extends TripSearchInterface {
  ranks?: TripRankEnum[];
  status?: TripStatusEnum;
}
