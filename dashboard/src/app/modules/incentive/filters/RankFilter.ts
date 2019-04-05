import { IncentiveRankFilterComponent } from '../components/filters/rank/component';

export class RankFilter {
  public static title = 'Classe de preuve';
  public static description = 'Filtre en fonction du niveau de classe de preuve';
  public static key = 'rank';
  public static ranks = [
    {
      value: 'A',
      label: 'A',
    },
    {
      value: 'B',
      label: 'B',
    },
    {
      value: 'C',
      label: 'C',
    },
  ];

  public static import(data) {
    if (data) {
      return data;
    }
    return [];
  }

  public static getFormComponent() {
    return IncentiveRankFilterComponent;
  }

  public static export(data) {
    return data;
  }

  public static toString(data):string {
    return `Les trajets dont la classe de preuve est : ${data.sort().join(', ')}`;
  }
}
