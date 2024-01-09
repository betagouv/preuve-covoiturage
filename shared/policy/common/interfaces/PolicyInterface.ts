import { BoundedSlices, UnboundedSlices } from './Slices';

export interface PolicyInterface {
  _id: number;
  territory_id: number;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  status: string;
  handler: string;
  incentive_sum: number;
  params: {
    slices?: BoundedSlices | UnboundedSlices;
    operators?: Array<string>;
    limits?: {
      glob?: number;
    };
    booster_dates?: Array<string>;
  };
}
