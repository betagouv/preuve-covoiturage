import { command, CommandInterface, ResultType } from "../../../../ilos/common/index.ts";
import { taggedLogger } from "@/lib/logger/tagged.ts";
import { PolicyRepositoryProviderInterfaceResolver } from "../interfaces/index.ts";

const log = taggedLogger("[campaign]", { maxLength: 512 });

@command({
  signature: "campaign:sync",
  description: "Sync incentive sum and status for all campaigns",
})
export class SyncCommand implements CommandInterface {
  constructor(
    protected policyRepository: PolicyRepositoryProviderInterfaceResolver,
  ) {}

  public async call(): Promise<ResultType> {
    // sync status
    log.info("sync statuses");
    await this.policyRepository.updateAllCampaignStatuses();

    // sync incentive sum
    log.info("sync incentive_sum");
    for (const campaign_id of await this.policyRepository.listApplicablePoliciesId()) {
      await this.policyRepository.syncIncentiveSum(campaign_id);
    }
  }
}
