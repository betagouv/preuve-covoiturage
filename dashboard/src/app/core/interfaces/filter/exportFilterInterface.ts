import { Moment } from 'moment';

export interface ExportFilterInterface {
  tz: string;
  date?: {
    start: string;
    end: string;
  };
  territory_id?: number[];
  operator_id?: number[];
}

export interface ExportFilterUxInterface {
  tz: string;
  date?: {
    start: Moment;
    end: Moment;
  };
  territory_id?: number[];
  operator_id?: number[];
}
