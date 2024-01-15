import { TerritorySelectorsInterface } from '../shared/territory/common/interfaces/TerritoryCodeInterface';
import { subMonthsTz, today } from '../helpers/shared/dates.helper';

export type Config = Partial<Params>;

export type Params = {
  start_at: Date;
  end_at: Date;
  operator_id: number[];
  geo_selector: TerritorySelectorsInterface;
  user_id: number | null;
  recipient_email?: string | null;
  recipient_fullname?: string | null;
  recipient_message?: string | null;
};

export class ExportParams {
  protected params: Params;

  protected readonly tz = 'Europe/Paris';
  protected readonly schema = {};
  protected readonly defaultConfig: Params = {
    start_at: subMonthsTz(today(this.tz), 1),
    end_at: today(),
    operator_id: [],
    geo_selector: { country: ['XXXXX'] }, // FRANCE
    user_id: null,
    recipient_email: null,
    recipient_fullname: null,
    recipient_message: null,
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

  // TODO to AbstractParams class
  protected validate<T>(config: T): void {
    // TODO validate params against schema or throw InvalidParamsException
  }
}
