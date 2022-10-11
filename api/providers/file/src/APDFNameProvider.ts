import { provider, ProviderInterface } from '@ilos/common';
import path from 'path';
import os from 'os';

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
  private ext = 'xlsx';

  public stringify(params: APDFNameParamsInterface): APDFNameResultsInterface {
    const { name, datetime, campaign_id, operator_id } = params;

    // APDF-2022-01-123-456-campaign-operator-hash.ext
    // 123: campaign_id
    // 456: operator_id
    const filename: string = [
      this.prefix,
      datetime.toISOString().substring(0, 7),
      campaign_id,
      operator_id,
      this.sanitize(name),
    ]
      .filter((s: string | number) => ['string', 'number'].indexOf(typeof s) > -1 && String(s).length)
      .join('-');

    return `${filename}.${this.ext}`;
  }

  public filepath(params: string | APDFNameParamsInterface): APDFNameResultsInterface {
    const filename = typeof params === 'string' ? params : this.stringify(params);
    return path.join(os.tmpdir(), filename);
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

  private sanitize(str: string): string {
    return str.toLowerCase().substring(0, 16).replace(/\ /g, '_').replace('-', '_');
  }
}
