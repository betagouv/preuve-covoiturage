import { StatCardInterface } from '~/core/interfaces/statCardInterface';

export class StatCard {
  public svgIcon: string;
  public title: string;
  public hint: string;
  public link?: string;

  constructor(obj: StatCardInterface) {
    this.svgIcon = obj.svgIcon;
    this.title = obj.title;
    this.hint = obj.hint;
    this.link = obj.link || null;
  }
}
