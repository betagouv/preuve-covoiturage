import {
  ConfigInterfaceResolver,
  KernelInterfaceResolver,
  provider,
} from "@/ilos/common/index.ts";
import {
  signature as campaignListSignature,
  SingleResultInterface,
} from "@/shared/policy/list.contract.ts";
import { Campaign } from "../models/Campaign.ts";

export interface CampaignRepositoryInterface {
  list(): Promise<Map<number, Campaign>>;
}

export abstract class CampaignRepositoryInterfaceResolver
  implements CampaignRepositoryInterface {
  public async list(): Promise<Map<number, Campaign>> {
    throw new Error("Not implemented");
  }
}

@provider({
  identifier: CampaignRepositoryInterfaceResolver,
})
export class CampaignRepository implements CampaignRepositoryInterface {
  constructor(
    protected kernel: KernelInterfaceResolver,
    protected config: ConfigInterfaceResolver,
  ) {}

  // list all campaigns
  public async list(): Promise<Map<number, Campaign>> {
    const campaigns = await this.kernel.call(
      campaignListSignature,
      {},
      {
        channel: { service: "export" },
        call: { user: { permissions: ["common.policy.list"] } },
      },
    );

    return campaigns.reduce(
      (
        acc: Map<SingleResultInterface["_id"], Campaign>,
        c: SingleResultInterface,
      ) => {
        acc.set(c._id, new Campaign(c, this.config));
        return acc;
      },
      new Map(),
    );
  }
}
