import { _ } from "@/deps.ts";

export type AllowedComputedFields = {
  campaign_mode: string;
  has_incentive: boolean;

  incentive_0_index: number;
  incentive_0_siret: string;
  incentive_0_amount: string;
  incentive_1_index: number;
  incentive_1_siret: string;
  incentive_1_amount: number;
  incentive_2_index: number;
  incentive_2_siret: string;
  incentive_2_amount: number;

  incentive_rpc_0_campaign_id: number;
  incentive_rpc_0_campaign_name: string;
  incentive_rpc_0_amount: number;
  incentive_rpc_1_campaign_id: number;
  incentive_rpc_1_campaign_name: string;
  incentive_rpc_1_amount: number;
  incentive_rpc_2_campaign_id: number;
  incentive_rpc_2_campaign_name: string;
  incentive_rpc_2_amount: number;
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

  public get(fields: string[] | undefined): Partial<CarpoolRowData> {
    // TODO transform if needed (dates, etc...)

    // pick fields or return the whole data
    return fields.length ? _.pick(this.data, fields) : this.data;
  }

  // type makes sure the field exists in the root dataset to avoid having
  // computed properties calling each other and creating race conditions.
  public value<K extends keyof CarpoolRowData>(
    name: K,
    defaultResult: CarpoolRowData[K] | null = null,
  ): CarpoolRowData[K] | null {
    return this.data[name] ?? defaultResult;
  }

  public addField(name: string, value: any): CarpoolRow {
    if (name in this.data) throw new Error(`Field ${name} already exists`);
    this.data[name] = value;

    return this;
  }

  public hasIncentive(): boolean {
    return true; // TODO sum incentive and check if > 0
  }
}
