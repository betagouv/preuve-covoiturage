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
  params: {
    slices?: Array<SliceInterface>;
    operators?: Array<string>;
    limits?: {
      glob?: number;
    };
  };
}
