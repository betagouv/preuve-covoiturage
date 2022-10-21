// eslint-disable-next-line max-len
import { SliceInterface } from '~/shared/policy/common/interfaces/SliceInterface';

export interface PolicyStatsInterface {
  count: number;
  sum: number;
  slices: SliceStatInterface[];
}

export interface SliceStatInterface {
  count: number;
  sum: number;
  slice: SliceInterface;
}

export interface SliceStatDBInterface {
  count: number;
  sum: number;
  slice_1_count?: number;
  slice_1_sum?: number;
  slice_1_start?: number;
  slice_1_end?: number;
  slice_2_count?: number;
  slice_2_sum?: number;
  slice_2_start?: number;
  slice_2_end?: number;
  slice_3_count?: number;
  slice_3_sum?: number;
  slice_3_start?: number;
  slice_3_end?: number;
  slice_4_count?: number;
  slice_4_sum?: number;
  slice_4_start?: number;
  slice_4_end?: number;
  slice_5_count?: number;
  slice_5_sum?: number;
  slice_5_start?: number;
  slice_5_end?: number;
  slice_6_count?: number;
  slice_6_sum?: number;
  slice_6_start?: number;
  slice_6_end?: number;
  slice_7_count?: number;
  slice_7_sum?: number;
  slice_7_start?: number;
  slice_7_end?: number;
  slice_8_count?: number;
  slice_8_sum?: number;
  slice_8_start?: number;
  slice_8_end?: number;
  slice_9_count?: number;
  slice_9_sum?: number;
  slice_9_start?: number;
  slice_9_end?: number;
  slice_10_count?: number;
  slice_10_sum?: number;
  slice_10_start?: number;
  slice_10_end?: number;
}
