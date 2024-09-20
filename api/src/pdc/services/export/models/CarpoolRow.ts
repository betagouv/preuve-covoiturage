import { pick } from "@/lib/object/index.ts";
import { CarpoolListType } from "@/pdc/services/export/repositories/queries/CarpoolListQuery.ts";

export type AllowedComputedFields = {
  incentive_type: string;
  has_incentive: boolean;
};

export type CarpoolRowData = CarpoolListType;

export type Incentive = {
  index: number;
  siret: string;
  amount: number;
};

export type IncentiveRPC = {
  siret: string;
  amount: number;
};

export class CarpoolRow {
  constructor(protected data: CarpoolRowData) {}

  /**
   * pick fields or return the whole data
   *
   * @param fields
   */
  public get(fields?: string[]): Partial<CarpoolRowData> {
    return fields && fields.length ? pick(this.data, fields) : this.data;
  }

  // type makes sure the field exists in the root dataset to avoid having
  // computed properties calling each other and creating race conditions.
  public value<K extends keyof CarpoolRowData>(
    name: K,
    defaultResult: CarpoolRowData[K] | null = null,
  ): CarpoolRowData[K] | null {
    return this.data[name] ?? defaultResult;
  }

  public addField(name: string, value: unknown): CarpoolRow {
    if (name in this.data) throw new Error(`Field ${name} already exists`);
    this.data[name] = value;

    return this;
  }

  public hasIncentive(): boolean {
    return true; // TODO sum incentive and check if > 0
  }
}
