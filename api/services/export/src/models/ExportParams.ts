import { Timezone } from '@pdc/provider-validator';
import { subMonthsTz, today } from '../helpers/shared/dates.helper';
import { TerritorySelectorsInterface } from '../shared/territory/common/interfaces/TerritoryCodeInterface';

export type Config = Partial<Params>;

export type Params = {
  start_at: Date;
  end_at: Date;
  operator_id: number[];
  geo_selector: TerritorySelectorsInterface;
  tz?: Timezone;
};

export class ExportParams {
  protected params: Params;

  protected readonly tz = 'Europe/Paris' as Timezone;
  protected readonly schema = {};
  protected readonly defaultConfig: Params = {
    start_at: subMonthsTz(today(this.tz), 1),
    end_at: today(),
    operator_id: [],
    geo_selector: { country: ['XXXXX'] }, // FRANCE
    tz: this.tz,
  };

  constructor(protected config: Config) {
    this.validate<Config>(config);
    this.params = this.normalize(config);
  }

  protected normalize(config: Config): Params {
    // TODO normalize params
    // apply limits to dates, etc...
    return { ...this.defaultConfig, ...config };
  }

  public get(): Params {
    if (!this.params) {
      throw new Error(`${__filename} not initialized`);
    }

    return this.params;
  }

  // convert geo_selector to SQL WHERE clause
  // using AND or OR to join start and end positions
  public geoToSQL(mode: 'AND' | 'OR' = 'OR'): string {
    const { geo_selector } = this.params;
    const start = Object.keys(geo_selector)
      .reduce((p, type) => {
        // join all codes per type
        const local = [];
        geo_selector[type].forEach((code: string) => {
          local.push(`gps.${type} = '${code}'`);
        });

        p.push(local.join(' OR '));
        return p;
      }, [])
      .join(' OR ');

    return `AND ((${start}) ${mode} (${start.replace(/gps\./g, 'gpe.')}))`;
  }

  // TODO to AbstractParams class
  protected validate<T>(config: T): void {
    // TODO validate params against schema or throw InvalidParamsException
  }

  public static fromJSON(json: Config): ExportParams {
    return new ExportParams(json);
  }

  public static toJSON(params: ExportParams): Config {
    return params.get();
  }
}
