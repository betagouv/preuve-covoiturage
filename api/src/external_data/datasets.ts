import { StaticAbstractDataset, StaticMigrable } from "@/etl/index.ts";
import { AiresCovoiturage } from "./datasets/AiresCovoiturage.ts";
import { IncentiveCampaigns } from "./datasets/IncentiveCampaigns.ts";
import { CreateAiresCovoiturageTable } from "./datastructures/CreateAiresCovoiturageTable.ts";
import { CreateIncentiveCampaignsTable } from "./datastructures/CreateIncentiveCampaignsTable.ts";
import { getAiresLastUrl } from "./helpers.ts";

export const datastructures: Set<StaticMigrable> = new Set([
  CreateAiresCovoiturageTable,
  CreateIncentiveCampaignsTable,
]);

export const datasets = async () => {
  // add Aires migration
  const AiresUrl =
    "https://transport.data.gouv.fr/api/datasets/5d6eaffc8b4c417cdc452ac3";
  const url = await getAiresLastUrl(AiresUrl);
  const datasets: Set<StaticAbstractDataset> = new Set([]);
  datasets.add(AiresCovoiturage(url));
  datasets.add(
    IncentiveCampaigns(
      "https://www.data.gouv.fr/fr/datasets/r/08f58ee3-7b3e-43d8-9e55-3c82bf406190",
    ),
  );
  return datasets;
};
