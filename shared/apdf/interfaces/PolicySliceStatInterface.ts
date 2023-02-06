// eslint-disable-next-line max-len
import { SliceInterface } from '../../policy/common/interfaces/SliceInterface';

export interface PolicyStatsInterface {
  total_count: number;
  total_sum: number;
  subsidized_count: number;
  slices: SliceStatInterface[];
}

export interface SliceStatInterface {
  count: number;
  sum: number;
  slice: SliceInterface;
}
