import { GetOldestTripDateRepositoryProvider } from './../providers/GetOldestTripRepositoryProvider';
import { handler, KernelInterfaceResolver } from '@ilos/common';
import { Action } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware/dist';
import moment from 'moment';
import { startOfMonth, endOfMonth } from '../helpers/getDefaultDates';
import {
  ParamsInterface as BuildExportParamInterface,
  ResultInterface as BuildExportResultInterface,
  signature as buildExportSignature,
} from '../shared/trip/buildExport.contract';

export interface StartEndDate {
  start: Date;
  end: Date;
}

@handler({
  service: 'trip',
  method: 'replayOpenData',
  middlewares: [...internalOnlyMiddlewares('trip')],
})
export class ReplayOpendataExportCommand extends Action {
  constructor(
    private getOldestTripDateRepositoryProvider: GetOldestTripDateRepositoryProvider,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: {}, context: {}): Promise<StartEndDate[]> {
    // 0. Get first trip journey_start_datetime
    const oldestTripDate: Date = await this.getOldestTripDateRepositoryProvider.call();
    // 1. Get all month from begining trip.list
    const intervals: StartEndDate[] = this.getMonthsIntervalsFrom(oldestTripDate, new Date());
    // 2. For each, call build opendata export
    intervals.map(async (i) => {
      const params: BuildExportParamInterface = {
        query: {
          date: i,
        },
        type: 'opendate',
        format: { tz: 'Europe/Paris' },
      };
      this.kernel.call<BuildExportParamInterface, BuildExportResultInterface>(buildExportSignature, params, null);
    });

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
    console.debug(intervals);
    return intervals;
  }
}
