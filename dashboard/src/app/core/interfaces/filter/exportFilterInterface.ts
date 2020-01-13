import { Moment } from 'moment';

export interface ExportFilterInterface {
  date?: {
    start: string;
    end: string;
  };
}

export interface ExportFilterUxInterface {
  date?: {
    start: Moment;
    end: Moment;
  };
}
