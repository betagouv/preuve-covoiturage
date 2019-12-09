import { Moment } from 'moment';

export interface ExportFilterInterface {
  date?: {
    start: Date;
    end: Date;
  };
}

export interface ExportFilterUxInterface {
  date?: {
    start: Moment;
    end: Moment;
  };
}
