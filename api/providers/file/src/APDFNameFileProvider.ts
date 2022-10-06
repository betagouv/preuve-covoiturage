import os from 'os';
import path from 'path';
import { v4 } from 'uuid';
import { provider, ProviderInterface } from '@ilos/common';

export interface APDFNameParamsInterface {
  datetime: Date;
  campaign: number | { _id: number; name: string; territory_id: number };
  operator: number | { _id: number; name: string };
  territory?: number | { _id: number; name: string };
}

export type APDFNameResultsInterface = string;

@provider()
export class APDFNameProvider implements ProviderInterface {
  private ext = 'xslx';

  public stringify(params: APDFNameParamsInterface): APDFNameResultsInterface {
    const { datetime, campaign, operator } = this.normalizeParams(params);

    // KEEP ?
    // const startDatePlus6Days: Date = new Date(datetime.valueOf());
    // startDatePlus6Days.setDate(startDatePlus6Days.getDate() + 6);
    // const month = this.getMonthString(startDatePlus6Days);

    // APDF-2022-01-123-456-campaign-operator-hash.ext
    // 123: campaign_id
    // 456: operator_id
    const filename = [
      'APDF',
      datetime.toISOString().substring(0, 7),
      this.getId(campaign),
      this.getId(operator),
      this.getName(operator),
      this.getName(campaign),
      v4().substring(0, 6),
    ].join('-');

    return path.join(os.tmpdir(), `${filename}.${this.ext}`);
  }

  public parse(str: APDFNameResultsInterface): APDFNameParamsInterface {
    // TODO
    return {
      datetime: new Date(),
      campaign: { _id: 1, name: '', territory_id: 1 },
      operator: { _id: 1, name: '' },
      territory: { _id: 1, name: '' },
    };
  }

  private normalizeParams(p: APDFNameParamsInterface): APDFNameParamsInterface {
    // TODO : fetch data to fill the missing data
    return p;
  }

  private getId(obj: number | { _id: number }): number | undefined {
    if (typeof obj === 'number') return obj;
    return '_id' in obj ? obj._id : undefined;
  }

  private getName(obj: number | { name: string }): string | undefined {
    if (typeof obj === 'number') return undefined;
    return 'name' in obj ? this.sanitize(obj.name) : undefined;
  }

  private sanitize(str: string): string {
    return str.toLowerCase().substring(0, 8).replace(/\ /g, '_').replace('-', '_');
  }

  // KEEP ?
  // private getMonthString(date: Date): string {
  //   return date
  //     .toLocaleString('fr-FR', { month: 'long' })
  //     .substring(0, 4)
  //     .normalize('NFD')
  //     .replace(/[\u0300-\u036f]/g, '');
  // }
}
