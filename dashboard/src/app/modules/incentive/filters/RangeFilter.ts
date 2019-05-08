import { IncentiveRangeFilterComponent } from '../components/filters/range/component';

export const MIN = 0;
export const MAX = 50;

export class RangeFilter {
  public static title = 'Distance parcourue';
  public static description = 'Filtre en fonction de la distance parcourue lors du trajet';
  public static key = 'range';

  public static import(data) {
    if (data && 'min' in data && 'max' in data) {
      return [data.min, data.max];
    }
    return [MIN, MAX];
  }

  public static getFormComponent() {
    return IncentiveRangeFilterComponent;
  }

  public static export(data) {
    return data.length > 0 ?
      {
        min: data[0],
        max: data[1],
      } : null;
  }

  public static toString(data):string {
    return `Les trajets compris entre ${data.min} et ${data.max} km.`;
  }
}
