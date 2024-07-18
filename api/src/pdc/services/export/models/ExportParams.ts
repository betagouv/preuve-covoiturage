import { subMonthsTz, today } from "@/pdc/helpers/dates.helper.ts";
import { Timezone } from "@/pdc/providers/validator/index.ts";
import {
  TerritorySelectorsInterface,
} from "@/shared/territory/common/interfaces/TerritoryCodeInterface.ts";

export type Config = Partial<Params>;

export type Params = {
  start_at: Date;
  end_at: Date;
  operator_id: number[];
  geo_selector: TerritorySelectorsInterface;
  tz: Timezone;
};

/**
 * Configure for the export
 *
 * @todo add validation
 * @todo add support for territory_id (territory_group._id)
 * @todo add support for SIREN
 */
export class ExportParams {
  protected params: Params;

  protected readonly tz = "Europe/Paris" as Timezone;
  protected readonly schema = {};
  protected readonly defaultConfig: Params = {
    start_at: subMonthsTz(today(this.tz), 1),
    end_at: today(),
    operator_id: [],
    geo_selector: { country: ["XXXXX"] }, // FRANCE
    tz: this.tz,
  };

  constructor(protected config: Config) {
    this.validate<Config>(config);
    this.params = this.normalize(config);
  }

  /**
   * Normalize params
   *
   * @todo normalize params
   * @todo apply limits to dates, etc...
   *
   * @param {Config} config
   * @returns {Params}
   */
  protected normalize(config: Config): Params {
    const n = { ...this.defaultConfig, ...config };
    n.start_at = new Date(n.start_at);
    n.end_at = new Date(n.end_at);
    return n;
  }

  /**
   * Getter for params
   *
   * @returns {Params}
   */
  public get(): Params {
    if (!this.params) {
      throw new Error(`${__filename} not initialized`);
    }

    return this.params;
  }

  /**
   * Convert geo_selector to SQL WHERE clause
   *
   * Using AND or OR to join start and end positions.
   * Default is OR.
   *
   * @param {string} mode
   * @returns {string}
   */
  public geoToSQL(mode: "AND" | "OR" = "OR"): string {
    const { geo_selector } = this.params;
    const start = Object.keys(geo_selector)
      .reduce((p, type) => {
        // join all codes per type
        const local: string[] = [];
        geo_selector[type].forEach((code: string) => {
          local.push(`gps.${type} = '${code}'`);
        });

        if (local.length) {
          p.push(local.join(" OR "));
        }

        return p;
      }, [] as string[]).join(" OR ");

    return `AND ((${start}) ${mode} (${start.replace(/gps\./g, "gpe.")}))`;
  }

  /**
   * convert operator_id to SQL WHERE clause
   *
   * @returns {string}
   */
  public operatorToSQL(): string {
    const { operator_id } = this.params;
    return operator_id.length
      ? `AND cc.operator_id IN (${operator_id.join(",")})`
      : "";
  }

  /**
   * Validate params
   *
   * @todo to AbstractParams class
   * @todo validate params against schema or throw InvalidParamsException
   *
   * @param {Config} config
   */
  protected validate<T>(config: T): void {}

  /**
   * Create ExportParams from JSON
   *
   * This is needed when gettin configuration from the database.
   * Specific convert rules can be applied here.
   *
   * @param {Config} json
   * @returns {ExportParams}
   */
  public static fromJSON(json: Config): ExportParams {
    return new ExportParams(json);
  }

  /**
   * Convert ExportParams to JSON
   *
   * This is needed to store the configuration in the database.
   * Specific convert rules can be applied here.
   *
   * @param {ExportParams} params
   * @returns {Config}
   */
  public static toJSON(params: ExportParams): Config {
    return params.get();
  }
}
