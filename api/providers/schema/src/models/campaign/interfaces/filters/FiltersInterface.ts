import { DistanceFilterInterface } from './DistanceFilterInterface';
import { InseeFilterInterface } from './InseeFilterInterface';
import { OperatorFilterInterface } from './OperatorFilterInterface';
import { RankFilterInterface } from './RankFilterInterface';
import { TimeFilterInterface } from './TimeFilterInterface';
import { WeekdayFilterInterface } from './WeekdayFilterInterface';

export type FiltersInterface =
  | DistanceFilterInterface
  | InseeFilterInterface
  | OperatorFilterInterface
  | RankFilterInterface
  | TimeFilterInterface
  | WeekdayFilterInterface;
