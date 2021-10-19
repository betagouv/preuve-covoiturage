import { ExportTripInterface } from './ExportTripInterface';

export interface PgCursorHandler {
  read: (count: number) => Promise<ExportTripInterface[]>;
  release?: Function;
}
