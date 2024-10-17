import { pick } from "@/lib/object/index.ts";
import { CarpoolStatusEnum } from "@/pdc/providers/carpool/interfaces/common.ts";

export type AllowedComputedFields = {
  trip_id: string;
  journey_start_datetime: string;
  journey_end_datetime: string;
  status: CarpoolStatusEnum;
  incentive_type: string;
  has_incentive: boolean;
};

export type Incentive = {
  index: number;
  siret: string;
  amount: number;
};

export type IncentiveRPC = {
  siret: string;
  amount: number;
};

export class CarpoolRow<T extends { [k: string]: unknown }> {
  constructor(protected data: T) {}

  /**
   * pick fields or return the whole data
   *
   * @param fields
   */
  public get(fields?: string[]): Partial<T> {
    return fields && fields.length ? pick(this.data, fields) : this.data;
  }

  // type makes sure the field exists in the root dataset to avoid having
  // computed properties calling each other and creating race conditions.
  public value<K extends keyof T>(
    name: K,
    defaultResult: T[K] | null = null,
  ): T[K] | null {
    return this.data[name] ?? defaultResult;
  }

  public addField(name: string, value: unknown): CarpoolRow<T> {
    this.data[name] = value;
    return this;
  }

  public hasIncentive(): boolean {
    // @ts-ignore has_incentive is a computed field. TODO: type the value() to accept additional fields
    const existing = this.value("has_incentive") as boolean | undefined;
    if (typeof existing !== "undefined") {
      return existing;
    }

    return this.incentiveFields()
      .some((key) => typeof key === "string" && key.includes("_siret") && this.value(key) !== null);
  }

  public incentiveFields<K extends keyof T>(): K[] {
    return Object
      .keys(this.data)
      .filter((key) => /incentive_[0-9]_.*/.test(key)) as K[];
  }

  public incentiveSum(): number {
    return this.incentiveFields()
      .filter((key) => typeof key === "string" && key.includes("_amount"))
      .map((key) => Number(this.value(key)))
      .filter((val) => !Number.isNaN(val))
      .reduce((acc, val) => acc + val, 0);
  }
}
