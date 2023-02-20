import { SliceInterface } from '../../policy/common/interfaces/Slices';

export interface PolicyStatsInterface {
  total_count: number;
  total_sum: number;
  subsidized_count: number;
  slices: SliceStatInterface[];
}

export interface SliceStatInterface {
  count: number;
  subsidized: number;
  sum: number;
  slice: SliceInterface;
}
