import { ParamsInterface } from '@shared/apdf/export.contract.ts';
import { addMonths, startOfMonth, subMonths } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { get } from 'lodash';

export function castExportParams(params: ParamsInterface): { start_date: Date; end_date: Date } {
  // use the local times
  const start_date_lc = get(params, 'query.date.start', null);
  const end_date_lc = get(params, 'query.date.end', null);

  // having both
  if (start_date_lc && end_date_lc) {
    return { start_date: new Date(start_date_lc), end_date: new Date(end_date_lc) };
  }

  // make a 1 month date range from start_date
  if (start_date_lc && !end_date_lc) {
    return { start_date: new Date(start_date_lc), end_date: addMonths(start_date_lc, 1) };
  }

  // make a 1 month date range from end_date
  if (!start_date_lc && end_date_lc) {
    return { start_date: subMonths(end_date_lc, 1), end_date: new Date(end_date_lc) };
  }

  // defaults
  const start = startOfMonth(subMonths(new Date(), 1));
  const end = startOfMonth(new Date());

  // timezoned
  return {
    start_date: fromZonedTime(start, params.format?.tz),
    end_date: fromZonedTime(end, params.format?.tz),
  };
}
