import { command, CommandInterface, CommandOptionType, KernelInterfaceResolver } from '@ilos/common';
import moment from 'moment';
import { endOfMonth, startOfMonth } from '../helpers/getDefaultDates';
import { GetOldestTripDateRepositoryProvider } from '../providers/GetOldestTripRepositoryProvider';
import {
  ParamsInterface as BuildExportParamInterface,
  ResultInterface as BuildExportResultInterface,
  signature as buildExportSignature,
} from '../shared/trip/buildExport.contract';

export interface StartEndDate {
  start: Date;
  end: Date;
}

@command()
export class ReplayOpendataExportCommand implements CommandInterface {
  static readonly signature: string = 'trip:replayOpendata';
  static readonly description: string = 'Replay open data exports for each month from first trip to now';
  static readonly options: CommandOptionType[] = [];

  constructor(
    private kernel: KernelInterfaceResolver,
    private getOldestTripDateRepositoryProvider: GetOldestTripDateRepositoryProvider,
  ) {}

  public async call(): Promise<StartEndDate[]> {
    // 0. Get first trip journey_start_datetime
    const oldestTripDate: Date = await this.getOldestTripDateRepositoryProvider.call();
    // 1. Get all month from begining trip.list
    const intervals: StartEndDate[] = this.getMonthsIntervalsFrom(oldestTripDate, new Date());
    // 2. For each, call build opendata export synchronously
    for (const i of intervals) {
      const params: BuildExportParamInterface = {
        query: {
          date: {
            start: (i.start.toISOString() as unknown) as Date,
            end: (i.end.toISOString() as unknown) as Date,
          },
        },
        type: 'opendata',
        format: { tz: 'Europe/Paris' },
      };
      await this.kernel.call<BuildExportParamInterface, BuildExportResultInterface>(buildExportSignature, params, {
        channel: { service: 'trip' },
      });
    }

    // 3. Return intervals used to create opendata exports
    return intervals;
  }

  private getMonthsIntervalsFrom(start: Date, end: Date): StartEndDate[] {
    const intervals: StartEndDate[] = [];
    const momentCursor: moment.Moment = moment(start);
    const momentEnd: moment.Moment = moment(endOfMonth(end));

    while (momentCursor.isBefore(momentEnd)) {
      intervals.push({
        start: startOfMonth(new Date(momentCursor.toDate())),
        end: endOfMonth(new Date(momentCursor.toDate())),
      });
      momentCursor.add(1, 'month');
    }
    return intervals;
  }
}
