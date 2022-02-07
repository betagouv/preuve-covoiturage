import { utcToZonedTime } from 'date-fns-tz';

export function endOfPreviousMonthDate(): Date {
  const defaultEndDate = new Date();
  defaultEndDate.setDate(1);
  defaultEndDate.setHours(0, 0, 0, -1);
  // Use a default timezone and not the server one
  // const timeZoneOffest: number = defaultEndDate.getTimezoneOffset() * 60000
  // console.debug(`old offset ${defaultEndDate.getTimezoneOffset()}`);
  // console.debug(`old ${defaultEndDate}`);
  // defaultEndDate.setTime(defaultEndDate.getTime() + timeZoneOffest)
  // const europeParis: Date = utcToZonedTime(defaultEndDate, 'Europe/Paris');
  // console.debug(`new offset -> ${europeParis.getTimezoneOffset()}`);
  // console.debug(`new -> ${europeParis}`);
  return defaultEndDate;
}

export function endOfMonth(date: Date = new Date()): Date {
  const endOfMonth: Date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  endOfMonth.setHours(0, 0, 0, -1);
  return endOfMonth;
}

export function startOfMonth(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// export function endOfPreviousMonthDate(): Date {
//   let defaultEndDate = new Date();
//   defaultEndDate = new Date(Date.UTC(defaultEndDate.getFullYear(), defaultEndDate.getMonth(), 0, 23,59,59,999))
//   // defaultEndDate.setDate(1);
//   // defaultEndDate.setHours(0, 0, 0, -1);
//   return defaultEndDate;
// }

// export function endOfMonth(date: Date = new Date()): Date {
//   return new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 0, 23,59,59,999));
// }

// export function startOfMonth(date: Date = new Date()): Date {
//   return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
// }
