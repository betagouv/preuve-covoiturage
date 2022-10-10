import os from 'os';
import path from 'path';
import { v4 } from 'uuid';
import { provider, ProviderInterface } from '@ilos/common';

export interface APDFNameParamsInterface {
  name: string;
  datetime: Date;
  campaign_id: number;
  operator_id: number;
}

export type APDFNameResultsInterface = string;

@provider()
export class APDFNameProvider implements ProviderInterface {
  private prefix = 'APDF';
  private ext = 'xslx';

  constructor(private log = null) {
    /* eslint-disable-next-line */
    this.log = log || console.log;
  }

  public stringify(params: APDFNameParamsInterface): APDFNameResultsInterface {
    const { datetime, campaign_id, operator_id } = this.normalizeParams(params);

    // KEEP ?
    // const startDatePlus6Days: Date = new Date(datetime.valueOf());
    // startDatePlus6Days.setDate(startDatePlus6Days.getDate() + 6);
    // const month = this.getMonthString(startDatePlus6Days);

    // APDF-2022-01-123-456-campaign-operator-hash.ext
    // 123: campaign_id
    // 456: operator_id
    const filename: string = [
      this.prefix,
      datetime.toISOString().substring(0, 7),
      campaign_id,
      operator_id,
      v4().substring(0, 6),
    ]
      .filter((s: string | number) => ['string', 'number'].indexOf(typeof s) > -1 && String(s).length)
      .join('-');

    return path.join(os.tmpdir(), `${filename}.${this.ext}`);
  }

  public parse(str: APDFNameResultsInterface): APDFNameParamsInterface {
    const parts = str.split('/').pop().replace(`${this.prefix}-`, '').replace(`.${this.ext}`, '').split('-');
    const name = parts.pop();

    return {
      name,
      datetime: new Date(`${parts[0]}-${parts[1]}-01T00:00:00Z`),
      campaign_id: parseInt(parts[2], 10),
      operator_id: parseInt(parts[3], 10),
    };
  }

  private normalizeParams(p: APDFNameParamsInterface): APDFNameParamsInterface {
    // TODO : fetch data to fill the missing data
    return p;
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
