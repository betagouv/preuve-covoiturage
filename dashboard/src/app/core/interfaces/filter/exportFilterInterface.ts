import { Moment } from 'moment';

export interface ExportFilterInterface {
  date?: {
    start: string;
    end: string;
  };
  territory_id?: number[];
  operator_id?: number[];
}

export interface ExportFilterUxInterface {
  date?: {
    start: Moment;
    end: Moment;
  };
  territory_id?: number[];
  operator_id?: number[];
}
