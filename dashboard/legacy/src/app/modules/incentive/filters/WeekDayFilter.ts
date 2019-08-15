import { IncentiveWeekdayFilterComponent } from '../components/filters/weekday/component';

export class WeekDayFilter {
  public static title = 'Jour de la semaine';
  public static description = 'Filtre en fonction du jour de la semaine';
  public static key = 'weekday';

  public static weekdays = [
    {
      key: 0,
      label: 'Lundi',
    },
    {
      key: 1,
      label: 'Mardi',
    },
    {
      key: 2,
      label: 'Mercredi',
    },
    {
      key: 3,
      label: 'Jeudi',
    },
    {
      key: 4,
      label: 'Vendredi',
    },
    {
      key: 5,
      label: 'Samedi',
    },
    {
      key: 6,
      label: 'Dimanche',
    },
  ];

  public static import(data) {
    return data;
  }

  public static getFormComponent() {
    return IncentiveWeekdayFilterComponent;
  }

  public static export(data) {
    return data && data.length > 0 ? data : null;
  }

  public static toString(data): string {
    const weekdaystring = data
      .map((wd) => WeekDayFilter.weekdays.find((lb) => lb.key === wd))
      .map((wd) => wd.label)
      .join(', ');
    return `Les trajets effectués le : ${weekdaystring}`;
  }
}
