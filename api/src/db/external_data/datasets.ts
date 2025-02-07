import { StaticAbstractDataset, StaticMigrable } from "../geo/index.ts";
import { AiresCovoiturage } from "./datasets/AiresCovoiturage.ts";
import { IncentiveCampaigns } from "./datasets/IncentiveCampaigns.ts";
import { CreateAiresCovoiturageTable } from "./datastructures/CreateAiresCovoiturageTable.ts";
import { CreateIncentiveCampaignsTable } from "./datastructures/CreateIncentiveCampaignsTable.ts";
import { getAiresLastUrl, getCampaignsLastUrl } from "./helpers.ts";

export const datastructures: Set<StaticMigrable> = new Set([
  CreateAiresCovoiturageTable,
  CreateIncentiveCampaignsTable,
]);

export const datasets = async () => {
  // add Aires migration
  const AiresUrl = "https://transport.data.gouv.fr/api/datasets/5d6eaffc8b4c417cdc452ac3";
  const airesResponse = await getAiresLastUrl(AiresUrl);
  const CampaignsUrl = "https://www.data.gouv.fr/api/1/datasets/64a436118c609995b0386541";
  const campaignsResponse = await getCampaignsLastUrl(CampaignsUrl);
  const datasets: Set<StaticAbstractDataset> = new Set([]);
  datasets.add(AiresCovoiturage(airesResponse));
  datasets.add(IncentiveCampaigns(campaignsResponse));
  return datasets;
};
