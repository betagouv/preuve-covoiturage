import { SliceInterface } from "../../policy/contracts/common/interfaces/Slices.ts";

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
