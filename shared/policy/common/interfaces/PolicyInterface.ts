import { SliceInterface } from './SliceInterface';

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
    slices?: Array<SliceInterface>;
    operators?: Array<string>;
    operators_id?: Array<number>;
    limits?: {
      glob?: number;
    };
  };
}
