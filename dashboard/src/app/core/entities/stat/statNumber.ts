import { StatNumberInterface } from '~/core/interfaces/stat/statNumberInterface';

export class StatNumber {
  public svgIcon: string;
  public title: string;
  public hint: string;
  public link?: string;
  public unit?: string;

  constructor(obj: StatNumberInterface) {
    this.svgIcon = obj.svgIcon;
    this.title = obj.title;
    this.hint = obj.hint;
    this.link = obj.link || null;
    this.unit = obj.unit || '';
  }
}
