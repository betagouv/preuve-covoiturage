import { IncentiveTimeFilterComponent } from '../components/filters/time/component';

export const DEFAULT_MIN: [number, number, number] = [8, 0, 0];   // tslint:disable-line no-magic-numbers
export const DEFAULT_MAX:[number, number, number] = [18, 0, 0];  // tslint:disable-line no-magic-numbers
export const MIN:[number, number, number] = [0, 0, 0];           // tslint:disable-line no-magic-numbers
export const MAX:[number, number, number] = [23, 59, 59];        // tslint:disable-line no-magic-numbers

export class TimeFilter {
  public static title = 'Horaire';
  public static description = 'Filtre en fonction de l\'heure';
  public static key = 'time';

  public static config = {
    max: MAX,
    min: MIN,
    defaultMax: DEFAULT_MAX,
    defaultMin: DEFAULT_MIN,
  };

  public static import(data) {
    if (data && data.length > 0) {
      return data.map(({ start, end }) => {
        const startTime = new Date();
        const endTime = new Date();

        const [sh, sm] = start.split(':');
        const [eh, em] = end.split(':');

        startTime.setHours(sh, sm);
        endTime.setHours(eh, em);

        return {
          start: startTime,
          end: endTime,
        };
      });
    }
    return [];
  }

  public static getFormComponent() {
    return IncentiveTimeFilterComponent;
  }

  public static export(data) {
    return data.map(({ start, end }) => { // tslint:disable-line
      return {
        start: `${start.getHours()}:${start.getMinutes()}`,
        end: `${end.getHours()}:${end.getMinutes()}`,
      };
    });
  }

  public static toString(data):string {
    let base = 'Les trajets effectué entre (au choix) : ';
    data.forEach(({ start, end }) => {
      base += `\n${start} et ${end}`;
    });
    return base;
  }
}
